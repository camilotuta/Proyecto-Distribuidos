# Script para iniciar el backend y frontend
# Ejecutar desde la carpeta java/

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Sistema de Gestión de Tienda" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Java
Write-Host "Verificando Java..." -ForegroundColor Yellow
java -version
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Java no está instalado o no está en el PATH" -ForegroundColor Red
    exit 1
}

# Verificar Node.js
Write-Host ""
Write-Host "Verificando Node.js..." -ForegroundColor Yellow
node --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Node.js no está instalado o no está en el PATH" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "Iniciando Backend (puerto 8080)..." -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Iniciar backend en segundo plano
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\tienda-backend'; mvn spring-boot:run"

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "Iniciando Frontend (puerto 5173)..." -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Esperar un poco para que el backend inicie
Start-Sleep -Seconds 5

# Iniciar frontend en segundo plano
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Servicios iniciados:" -ForegroundColor Cyan
Write-Host "- Backend:  http://localhost:8080" -ForegroundColor White
Write-Host "- Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona cualquier tecla para cerrar este script..." -ForegroundColor Yellow
Write-Host "(Los servicios seguirán ejecutándose en las ventanas abiertas)" -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
