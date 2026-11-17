# Starts the development stack (frontend on :3000, backend on :8000).
$ErrorActionPreference = 'Stop'

try {
    docker version --format '{{.Server.Version}}' | Out-Null
} catch {
    Write-Host 'Docker is not running. Start Docker Desktop first.' -ForegroundColor Red
    exit 1
}

Set-Location $PSScriptRoot
Write-Host 'Starting development environment...' -ForegroundColor Green
docker compose up -d --build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ''
Write-Host 'Frontend: http://localhost:3000 (first start runs npm install; give it a minute)' -ForegroundColor Cyan
Write-Host 'Backend:  http://localhost:8000/health' -ForegroundColor Cyan
Write-Host 'Logs:     docker compose logs -f frontend backend' -ForegroundColor Gray
Write-Host 'Stop:     docker compose down' -ForegroundColor Gray
