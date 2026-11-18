# Builds and starts the production stack (Nginx on :8080, backend internal).
$ErrorActionPreference = 'Stop'

try {
    docker version --format '{{.Server.Version}}' | Out-Null
} catch {
    Write-Host 'Docker is not running. Start Docker Desktop first.' -ForegroundColor Red
    exit 1
}

# Run from the repository root (this script lives in scripts/).
Set-Location (Split-Path -Parent $PSScriptRoot)
Write-Host 'Building and starting production environment...' -ForegroundColor Green
docker compose -f docker-compose.prod.yml up -d --build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ''
Write-Host 'Site:   http://localhost:8080' -ForegroundColor Cyan
Write-Host 'Health: http://localhost:8080/health' -ForegroundColor Gray
Write-Host 'Logs:   docker compose -f docker-compose.prod.yml logs -f frontend backend' -ForegroundColor Gray
Write-Host 'Stop:   docker compose -f docker-compose.prod.yml down' -ForegroundColor Gray
