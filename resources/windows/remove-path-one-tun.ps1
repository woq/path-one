$ErrorActionPreference = 'Stop'
$adapter = Get-NetAdapter -Name 'PathOneTun' -ErrorAction SilentlyContinue
if (-not $adapter) {
  Write-Output '没有名为 PathOneTun 的适配器。'
  exit 0
}

Disable-NetAdapter -Name 'PathOneTun' -Confirm:$false -ErrorAction SilentlyContinue
Remove-NetAdapter -Name 'PathOneTun' -Confirm:$false
Write-Output '已移除 PathOneTun。'
exit 0
