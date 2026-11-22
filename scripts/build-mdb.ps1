# 建立空的 watercontrol.mdb（Jet 4.0 / Access 2000 格式，給 ll3 的 ASP 使用），裡面只有 users 表
# 必須用 32 位元 PowerShell 執行（Jet 4.0 只有 32 位元）：
#   C:\Windows\SysWOW64\WindowsPowerShell\v1.0\powershell.exe -NoProfile -File scripts\build-mdb.ps1
# 產生在 data-export\watercontrol.mdb（不進 git），再用 scripts\upload-mdb.ps1 上傳
$ErrorActionPreference = 'Stop'
if ([IntPtr]::Size -ne 4) { throw '請用 32 位元 PowerShell 執行（C:\Windows\SysWOW64\WindowsPowerShell\v1.0\powershell.exe）' }
$root = Split-Path -Parent $PSScriptRoot
$dir = Join-Path $root 'data-export'
$mdb = Join-Path $dir 'watercontrol.mdb'
New-Item -ItemType Directory -Force $dir | Out-Null
if (Test-Path $mdb) { Remove-Item $mdb -Force }

$cat = New-Object -ComObject ADOX.Catalog
$cat.Create("Provider=Microsoft.Jet.OLEDB.4.0;Data Source=$mdb;Jet OLEDB:Engine Type=5") | Out-Null
$cn = $cat.ActiveConnection
# 欄位和 admin_api.asp 的 ensureUsers 一致
$cn.Execute('CREATE TABLE users (id TEXT(16) CONSTRAINT pk_users PRIMARY KEY, email TEXT(120) NOT NULL, password_hash TEXT(100) NOT NULL, name TEXT(50), role TEXT(10) NOT NULL, active BIT, last_login DATETIME, created_at DATETIME, updated_at DATETIME)') | Out-Null
$cn.Execute('CREATE UNIQUE INDEX ux_users_email ON users (email)') | Out-Null
$cn.Close()
Write-Host ("已建立 {0}（{1:N0} bytes）" -f $mdb, (Get-Item $mdb).Length)
