'use client';
import { Suspense, useEffect, useState } from 'react';
import { KeyRound, Plus, Trash2 } from 'lucide-react';
import { useCodeGate } from '@/components/code-modal';
import { UnlockPanel } from '@/components/unlock-panel';
import { Badge, Button, Field, Input, Modal, PageHeader, Select, Table, Td } from '@/components/admin-ui';
import { call, errMsg, useMe, type CodeResult } from '@/lib/client';

/** 解鎖倒數會讀「現在時間」，包在 Suspense 裡改在瀏覽器畫，不在 build 時預先產生 */
export default function AdminPage() {
  return (
    <Suspense fallback={<p className="py-16 text-center text-muted">載入中…</p>}>
      <AdminContent />
    </Suspense>
  );
}

function AdminContent() {
  return (
    <>
      <PageHeader title="後台管理" desc="管理登入帳號。只有管理者看得到這一頁；排程、灌溉紀錄、告警等資料，等那些功能開發時再加進後台。" />
      <UnlockPanel />
      <h2 className="mb-3 text-lg font-bold text-ink">使用者管理</h2>
      <UsersTab />
    </>
  );
}

/** 新增、重設密碼前先確認驗證碼（只檢查、不修改資料） */
async function verifyCode(action: 'create' | 'update' | 'delete', code: string): Promise<CodeResult> {
  try {
    await call('/api/verify-code', { method: 'POST', body: JSON.stringify({ action, code }) });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

const fmtTime = (s: string | null) => (s ? s.replace('T', ' ').slice(0, 16) : '—');

/* ================= 使用者管理 ================= */
type User = { id: string; email: string; name: string; role: 'admin' | 'user'; active: boolean; lastLoginAt: string | null; createdAt: string | null };

function UsersTab() {
  const me = useMe();
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState<{ code: string } | null>(null);
  const [resetting, setResetting] = useState<{ user: User; code: string } | null>(null);
  const [nameKey, setNameKey] = useState(0);
  const gate = useCodeGate();

  useEffect(() => {
    call<User[]>('/api/admin/users').then(setUsers, e => setError(errMsg(e)));
  }, []);

  async function patch(u: User, body: Partial<User> & { password?: string }, code: string): Promise<CodeResult> {
    try {
      const saved = await call<User>(`/api/admin/users/${u.id}`, { method: 'PATCH', body: JSON.stringify(body), code });
      setUsers(list => list?.map(x => (x.id === saved.id ? saved : x)) ?? null);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: errMsg(e) };
    }
  }

  const askPatch = (u: User, body: Partial<User>, what: string) => gate.ask({
    title: '修改使用者', confirmLabel: '確認修改',
    message: <>修改 <b>{u.email}</b> 的{what}需要驗證碼。</>,
    submit: code => patch(u, body, code),
    onCancel: () => setNameKey(k => k + 1),
  });

  const askAdd = () => gate.ask({
    title: '新增使用者', confirmLabel: '下一步', message: '新增使用者需要驗證碼。',
    submit: async code => {
      const res = await verifyCode('create', code);
      if (res.ok) setAdding({ code });
      return res;
    },
  });

  const askReset = (u: User) => gate.ask({
    title: '重設密碼', confirmLabel: '下一步', message: <>重設 <b>{u.email}</b> 的密碼需要驗證碼。</>,
    submit: async code => {
      const res = await verifyCode('update', code);
      if (res.ok) setResetting({ user: u, code });
      return res;
    },
  });

  const askDelete = (u: User) => gate.ask({
    title: '刪除使用者', confirmLabel: '確認刪除', danger: true,
    message: <>即將刪除使用者 <b>{u.email}</b>，無法復原。</>,
    submit: async code => {
      try {
        await call(`/api/admin/users/${u.id}`, { method: 'DELETE', code });
        setUsers(list => list?.filter(x => x.id !== u.id) ?? null);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: errMsg(e) };
      }
    },
  });

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">管理者可以進入後台、修改資料；一般使用者登入後只能查看，不能操作控制箱或修改排程、設定。沒有註冊頁，帳號都從這裡建立。帳號存在 ll3 的 watercontrol.mdb（users 表），密碼只存加密後的雜湊。</p>
        <Button onClick={askAdd}><Plus size={16} /> 新增使用者</Button>
      </div>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <Table head={['Email', '名稱', '身分', '狀態', '最後登入', '建立時間', '']}>
        {users?.map(u => {
          const self = u.id === me?.id;
          return (
            <tr key={u.id} className="hover:bg-surface-2">
              <Td className="font-medium text-ink">{u.email} {self && <Badge tone="green">我</Badge>}</Td>
              <Td>
                <Input key={`${u.name}-${nameKey}`} defaultValue={u.name} placeholder="（未填）" className="min-w-28"
                  onBlur={e => e.target.value !== u.name && askPatch(u, { name: e.target.value }, '名稱')} />
              </Td>
              <Td>
                <Select value={u.role} disabled={self} className="min-w-32" title={self ? '不能變更自己的身分' : undefined}
                  onChange={e => askPatch(u, { role: e.target.value as User['role'] }, '身分')}>
                  <option value="admin">管理者</option>
                  <option value="user">一般使用者</option>
                </Select>
              </Td>
              <Td>
                <label className={`flex items-center gap-2 whitespace-nowrap ${self ? 'opacity-50' : 'cursor-pointer'}`}>
                  <input type="checkbox" checked={u.active} disabled={self} className="h-4 w-4 accent-[var(--brand)]"
                    onChange={e => askPatch(u, { active: e.target.checked }, e.target.checked ? '狀態（啟用）' : '狀態（停用）')} />
                  {u.active ? '啟用' : <span className="text-red-600">停用</span>}
                </label>
              </Td>
              <Td className="whitespace-nowrap text-muted">{fmtTime(u.lastLoginAt)}</Td>
              <Td className="whitespace-nowrap text-muted">{fmtTime(u.createdAt)}</Td>
              <Td className="whitespace-nowrap text-right">
                <Button size="sm" variant="ghost" onClick={() => askReset(u)}><KeyRound size={14} /> 重設密碼</Button>
                {!self && <Button size="sm" variant="ghost" className="text-red-600" onClick={() => askDelete(u)} title="刪除"><Trash2 size={14} /></Button>}
              </Td>
            </tr>
          );
        })}
        {users === null && !error && <tr><Td colSpan={7} className="py-8 text-center text-muted">載入中…</Td></tr>}
      </Table>
      {gate.dialog}
      {adding && <AddUserModal code={adding.code} onClose={() => setAdding(null)} onAdded={u => setUsers(list => [...(list ?? []), u])} />}
      {resetting && (
        <PasswordModal user={resetting.user} onClose={() => setResetting(null)} onSave={p => patch(resetting.user, { password: p }, resetting.code)} />
      )}
    </>
  );
}

function AddUserModal({ code, onClose, onAdded }: { code: string; onClose: () => void; onAdded: (u: User) => void }) {
  const [form, setForm] = useState({ email: '', name: '', password: '', role: 'user' as User['role'] });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      onAdded(await call<User>('/api/admin/users', { method: 'POST', body: JSON.stringify(form), code }));
      onClose();
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="新增使用者" footer={<>
      <Button variant="secondary" onClick={onClose}>取消</Button>
      <Button type="submit" form="add-user" disabled={busy}>{busy ? '建立中…' : '建立'}</Button>
    </>}>
      <form id="add-user" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" className="sm:col-span-2">
          <Input type="email" required autoFocus value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="名稱"><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="例：阿明" /></Field>
        <Field label="身分">
          <Select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as User['role'] })}>
            <option value="user">一般使用者（只能看）</option>
            <option value="admin">管理者</option>
          </Select>
        </Field>
        <Field label="密碼（至少 8 個字元）" className="sm:col-span-2">
          <Input type="password" required minLength={8} autoComplete="new-password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        </Field>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">{error}</p>}
      </form>
    </Modal>
  );
}

function PasswordModal({ user, onClose, onSave }: { user: User; onClose: () => void; onSave: (p: string) => Promise<CodeResult> }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await onSave(password);
    if (res.ok) return onClose();
    alert(`修改失敗：${res.error}`);
    setBusy(false);
  }
  return (
    <Modal open onClose={onClose} title={`重設密碼：${user.email}`} footer={<>
      <Button variant="secondary" onClick={onClose}>取消</Button>
      <Button type="submit" form="reset-password" disabled={busy}>{busy ? '儲存中…' : '儲存新密碼'}</Button>
    </>}>
      <form id="reset-password" onSubmit={submit}>
        <Field label="新密碼（至少 8 個字元）">
          <Input type="password" required minLength={8} autoFocus autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} />
        </Field>
      </form>
    </Modal>
  );
}
