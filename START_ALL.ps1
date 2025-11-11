# Script maestro para iniciar TODOS los servicios
# Backend Java + Frontend Java + Backend Node + Frontend Node

Write-Host "============================================" -ForegroundColor Magenta
Write-Host "   INICIANDO TODOS LOS SERVICIOS" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta
Write-Host ""

$rootPath = $PSScriptRoot

# 1. Backend Java (puerto 8080)
Write-Host "[1/4] Iniciando Backend Java (puerto 8080)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootPath\java\tienda-backend'; Write-Host 'Backend Java - Puerto 8080' -ForegroundColor Green; mvn spring-boot:run"
Start-Sleep -Seconds 2

# 2. Backend Node (puerto 3000)
Write-Host "[2/4] Iniciando Backend Node (puerto 3000)..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootPath\node\backend'; Write-Host 'Backend Node - Puerto 3000' -ForegroundColor Blue; npm start"
Start-Sleep -Seconds 3

# 3. Frontend Java (puerto 5173)
Write-Host "[3/4] Iniciando Frontend Java (puerto 5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootPath\java\frontend'; Write-Host 'Frontend Java - Puerto 5173' -ForegroundColor Green; npm run dev"
Start-Sleep -Seconds 2

# 4. Frontend Node (puerto 5174)
Write-Host "[4/4] Iniciando Frontend Node (puerto 5174)..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootPath\node\frontend'; Write-Host 'Frontend Node - Puerto 5174' -ForegroundColor Blue; npm run dev"
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "   TODOS LOS SERVICIOS INICIADOS" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "🌿 SISTEMA JAVA (Verde):" -ForegroundColor Green
Write-Host "   - Backend:  http://localhost:8080" -ForegroundColor White
Write-Host "   - Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "💎 SISTEMA NODE (Azul):" -ForegroundColor Blue
Write-Host "   - Backend:  http://localhost:3000" -ForegroundColor White
Write-Host "   - Frontend: http://localhost:5174" -ForegroundColor White
Write-Host ""
Write-Host "============================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "Los servicios están corriendo en ventanas separadas." -ForegroundColor Yellow
Write-Host "Cierra cada ventana individualmente para detener cada servicio." -ForegroundColor Yellow
Write-Host ""

Read-Host "Presiona Enter para cerrar este script"
