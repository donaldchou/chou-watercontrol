<%@ Language="JScript" CodePage=65001 %>
<!--#include file="config.asp"-->
<%
// chou-watercontrol 後台 API：只給 Vercel（Next.js）呼叫，POST key=API_KEY&action=...
// 目前只有帳號（users 表，在 \database\watercontrol.mdb）。之後的排程、灌溉紀錄等再加 action。
// 回傳一律 HTTP 200 + JSON：{"ok":true,"data":...} 或 {"ok":false,"status":400,"error":"..."}
// （IIS 會把 4xx/5xx 的內容換成制式錯誤頁，所以錯誤碼放在 JSON 裡）
// 密碼不在這裡計算：Vercel 用 bcrypt 雜湊後只把 password_hash 傳過來存
Response.CodePage = 65001;
Response.Charset = 'utf-8';
Response.ContentType = 'application/json';

function fail(status, msg) { var e = new Error(msg); e.status = status; return e; }
function pad2(n) { return (n < 10 ? '0' : '') + n; }
function sqlStr(s) { return "'" + String(s).replace(/'/g, "''") + "'"; }
function openDb() {
	var c = Server.CreateObject('ADODB.Connection');
	c.Open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=' + Server.MapPath(DB_PATH));
	return c;
}

// ---------------- JSON 輸出 ----------------
function jsonStr(s) {
	return '"' + String(s).replace(/[\\"\u0000-\u001f  ]/g, function (c) {
		var m = { '\\': '\\\\', '"': '\\"', '\n': '\\n', '\r': '\\r', '\t': '\\t' };
		return m[c] || '\\u' + ('000' + c.charCodeAt(0).toString(16)).slice(-4);
	}) + '"';
}
function isoLocal(d) {
	return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + 'T' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
}
function toJSON(v) {
	if (v === null || v === undefined) return 'null';
	if (typeof v === 'number') return isFinite(v) ? String(v) : 'null';
	if (typeof v === 'boolean') return v ? 'true' : 'false';
	if (typeof v === 'string') return jsonStr(v);
	if (v instanceof Date) return jsonStr(isoLocal(v));
	if (v instanceof Array) { var a = []; for (var i = 0; i < v.length; i++) a.push(toJSON(v[i])); return '[' + a.join(',') + ']'; }
	var o = [];
	for (var k in v) o.push(jsonStr(k) + ':' + toJSON(v[k]));
	return '{' + o.join(',') + '}';
}
/** ADO 欄位值 → JS 值（日期轉 Date、空值轉 null） */
function adoVal(f) {
	var v = f.Value;
	if (v === null || v === undefined) return null;
	if (f.Type === 7 || f.Type === 135) return new Date(v);
	if (f.Type === 11) return !!v;
	if (typeof v === 'number') return v;
	return String(v);
}

// ---------------- 參數 ----------------
function param(name) {
	var v = String(Request.Form(name));
	return v === 'undefined' ? '' : v;
}
function need(name) {
	var v = param(name);
	if (v === '') throw fail(400, '缺少參數 ' + name);
	return v;
}

// ---------------- 帳號 ----------------
var USER_COLS = ['id', 'email', 'name', 'role', 'active', 'last_login', 'created_at', 'updated_at'];

function ensureUsers(c) {
	try { c.Execute('SELECT TOP 1 id FROM users'); return; } catch (e) {}
	c.Execute('CREATE TABLE users (id TEXT(16) CONSTRAINT pk_users PRIMARY KEY, email TEXT(120) NOT NULL, password_hash TEXT(100) NOT NULL, ' +
		'name TEXT(50), role TEXT(10) NOT NULL, active BIT, last_login DATETIME, created_at DATETIME, updated_at DATETIME)');
	c.Execute('CREATE UNIQUE INDEX ux_users_email ON users (email)');
}
function userRow(rs, withHash) {
	var u = {};
	for (var i = 0; i < USER_COLS.length; i++) u[USER_COLS[i]] = adoVal(rs(USER_COLS[i]));
	if (withHash) u.password_hash = String(rs('password_hash').Value);
	return u;
}
function findUser(c, where, withHash) {
	var rs = c.Execute('SELECT * FROM users WHERE ' + where), u = rs.EOF ? null : userRow(rs, withHash);
	rs.Close();
	return u;
}
function newId() {
	var s = '', a = 'abcdefghijklmnopqrstuvwxyz0123456789';
	for (var i = 0; i < 10; i++) s += a.charAt(Math.floor(Math.random() * a.length));
	return s;
}
function cleanEmail(s) {
	s = String(s).replace(/^\s+|\s+$/g, '').toLowerCase();
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) || s.length > 120) throw fail(400, 'email 格式不正確');
	return s;
}
function cleanRole(s) {
	if (s !== 'admin' && s !== 'user') throw fail(400, '身分只能是 admin（管理者）或 user（一般使用者）');
	return s;
}
function cleanHash(s) {
	if (!/^\$2[aby]\$\d\d\$[.\/A-Za-z0-9]{53}$/.test(s)) throw fail(400, '密碼雜湊格式不正確');
	return s;
}
function countAdmins(c, exceptId) {
	var rs = c.Execute("SELECT COUNT(*) FROM users WHERE role='admin' AND active=True" + (exceptId ? ' AND id<>' + sqlStr(exceptId) : ''));
	var n = rs(0).Value;
	rs.Close();
	return n;
}

// ---------------- 主程式 ----------------
var c = null, out;
try {
	if (param('key') !== API_KEY) throw fail(403, 'forbidden');
	c = openDb();
	ensureUsers(c);
	var action = need('action'), data = null;

	if (action === 'ping') {
		data = { ok: true };

	} else if (action === 'user_by_email') {
		data = findUser(c, 'email=' + sqlStr(cleanEmail(need('email'))), true);

	} else if (action === 'user_get') {
		data = findUser(c, 'id=' + sqlStr(need('id')), false);

	} else if (action === 'user_list') {
		var rsU = c.Execute('SELECT * FROM users ORDER BY role, created_at');
		data = [];
		while (!rsU.EOF) { data.push(userRow(rsU, false)); rsU.MoveNext(); }
		rsU.Close();

	} else if (action === 'user_create') {
		var email = cleanEmail(need('email'));
		if (findUser(c, 'email=' + sqlStr(email), false)) throw fail(409, email + ' 已經有帳號了');
		var rsC = Server.CreateObject('ADODB.Recordset');
		rsC.Open('users', c, 1, 3, 2);
		rsC.AddNew();
		var id = newId();
		rsC('id').Value = id;
		rsC('email').Value = email;
		rsC('password_hash').Value = cleanHash(need('password_hash'));
		rsC('name').Value = param('name').substr(0, 50);
		rsC('role').Value = cleanRole(param('role') || 'user');
		rsC('active').Value = true;
		rsC('created_at').Value = new Date().getVarDate();
		rsC('updated_at').Value = new Date().getVarDate();
		rsC.Update();
		rsC.Close();
		data = findUser(c, 'id=' + sqlStr(id), false);

	} else if (action === 'user_update') {
		var uid = need('id'), cur = findUser(c, 'id=' + sqlStr(uid), false);
		if (!cur) throw fail(404, '找不到這個使用者');
		var rsE = Server.CreateObject('ADODB.Recordset');
		rsE.Open('SELECT * FROM users WHERE id=' + sqlStr(uid), c, 1, 3);
		if (param('name') !== '' || param('clear_name') === '1') rsE('name').Value = param('name').substr(0, 50);
		if (param('role') !== '') {
			var role = cleanRole(param('role'));
			if (cur.role === 'admin' && role !== 'admin' && countAdmins(c, uid) === 0) throw fail(400, '至少要保留一位啟用中的管理者');
			rsE('role').Value = role;
		}
		if (param('active') !== '') {
			var act = param('active') === '1';
			if (!act && cur.role === 'admin' && countAdmins(c, uid) === 0) throw fail(400, '至少要保留一位啟用中的管理者');
			rsE('active').Value = act;
		}
		if (param('password_hash') !== '') rsE('password_hash').Value = cleanHash(param('password_hash'));
		if (param('touch_login') === '1') rsE('last_login').Value = new Date().getVarDate();
		else rsE('updated_at').Value = new Date().getVarDate();
		rsE.Update();
		rsE.Close();
		data = findUser(c, 'id=' + sqlStr(uid), false);

	} else if (action === 'user_delete') {
		var did = need('id'), du = findUser(c, 'id=' + sqlStr(did), false);
		if (!du) throw fail(404, '找不到這個使用者');
		if (du.role === 'admin' && countAdmins(c, did) === 0) throw fail(400, '至少要保留一位啟用中的管理者');
		c.Execute('DELETE FROM users WHERE id=' + sqlStr(did));
		data = { deleted: did };

	} else {
		throw fail(400, '不認識的 action：' + action);
	}
	out = '{"ok":true,"data":' + toJSON(data) + '}';
} catch (e) {
	out = '{"ok":false,"status":' + (e.status || 500) + ',"error":' + jsonStr(e.message || String(e)) + '}';
}
if (c) try { c.Close(); } catch (e2) {}
Response.Write(out);
%>
