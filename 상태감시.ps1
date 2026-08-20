# MORU 터널 상태감시 + 절전방지
# 이 창이 켜져 있는 동안 노트북이 자지 않는다.

Add-Type -Name Power -Namespace Win32 -MemberDefinition @'
[DllImport("kernel32.dll", CharSet=CharSet.Auto, SetLastError=true)]
public static extern uint SetThreadExecutionState(uint esFlags);
'@

$ES_CONTINUOUS       = [uint32]"0x80000000"
$ES_SYSTEM_REQUIRED  = [uint32]"0x00000001"
$ES_DISPLAY_REQUIRED = [uint32]"0x00000002"
[Win32.Power]::SetThreadExecutionState($ES_CONTINUOUS -bor $ES_SYSTEM_REQUIRED -bor $ES_DISPLAY_REQUIRED) | Out-Null

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "  MORU 터널 상태감시" -ForegroundColor Cyan
Write-Host ""
Write-Host "  이 창이 켜져 있는 동안 노트북은 절전에 들어가지 않습니다." -ForegroundColor Cyan
Write-Host "  15초마다 실제로 주소를 찔러봅니다." -ForegroundColor Cyan
Write-Host "  빨간 줄이 뜨면 터널이 죽은 것입니다." -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

$url = "https://fyfeltw-anonymous-8082.exp.direct/"
$headers = @{ "expo-platform" = "ios"; "accept" = "application/expo+json,application/json" }
$fails = 0

while ($true) {
  $t = Get-Date -Format "HH:mm:ss"
  try {
    $r = Invoke-WebRequest -Uri $url -Headers $headers -TimeoutSec 15 -UseBasicParsing -ErrorAction Stop
    # PowerShell 5.1 은 application/expo+json 을 텍스트로 안 보고 byte[] 로 준다. 직접 디코드한다.
    if ($r.Content -is [byte[]]) { $text = [System.Text.Encoding]::UTF8.GetString($r.Content) } else { $text = $r.Content }
    $rv = ($text | ConvertFrom-Json).runtimeVersion
    if ($rv -eq "exposdk:54.0.0") {
      Write-Host "[$t]  정상 — 아이폰에서 열립니다" -ForegroundColor Green
      $fails = 0
    } else {
      Write-Host "[$t]  주의 — SDK 가 다릅니다: $rv" -ForegroundColor Yellow
    }
  } catch {
    $fails = $fails + 1
    Write-Host "[$t]  끊김!! 터널이 죽었습니다 (연속 $fails 회)" -ForegroundColor Red
    Write-Host "         터널켜기 창을 보세요. 5초 뒤 자동 재기동됩니다." -ForegroundColor Red
    Write-Host "         창이 아예 닫혀 있으면 다시 더블클릭하세요." -ForegroundColor Red
    [console]::beep(880, 350)
  }
  Start-Sleep -Seconds 15
}
