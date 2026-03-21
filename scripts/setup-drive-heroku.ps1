param(
  [Parameter(Mandatory = $true)]
  [string]$AppName,

  [Parameter(Mandatory = $true)]
  [string]$ServiceAccountJsonPath,

  [Parameter(Mandatory = $true)]
  [string]$DriveFolderId,

  [string]$DriveFileName = "notes.xlsx"
)

if (-not (Test-Path $ServiceAccountJsonPath)) {
  Write-Error "Service account JSON file not found: $ServiceAccountJsonPath"
  exit 1
}

$json = Get-Content -Raw -Path $ServiceAccountJsonPath | ConvertFrom-Json
$jsonRaw = Get-Content -Raw -Path $ServiceAccountJsonPath

if (-not $json.client_email -or -not $json.private_key) {
  Write-Error "Invalid service account JSON. Missing client_email or private_key."
  exit 1
}

$privateKeyEscaped = $json.private_key -replace "`r?`n", "\\n"
$jsonBase64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($jsonRaw))

heroku config:set `
  DRIVE_SYNC_ENABLED="true" `
  GOOGLE_DRIVE_FOLDER_ID="$DriveFolderId" `
  GOOGLE_DRIVE_FILE_NAME="$DriveFileName" `
  GOOGLE_SERVICE_ACCOUNT_JSON_B64="$jsonBase64" `
  GOOGLE_SERVICE_ACCOUNT_EMAIL="$($json.client_email)" `
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="$privateKeyEscaped" `
  --app $AppName

if ($LASTEXITCODE -ne 0) {
  Write-Error "Failed to set Heroku config vars"
  exit 1
}

Write-Host "Done. Please share the Drive folder with service account email:" -ForegroundColor Green
Write-Host $json.client_email -ForegroundColor Yellow
Write-Host "Then test: https://$AppName.herokuapp.com/api/health" -ForegroundColor Green
