# Script PowerShell para resetear secuencias de PostgreSQL
# Asegúrate de tener psql en tu PATH o ajusta la ruta

$dbHost = "localhost"
$dbPort = "5432"
$dbName = "postgres"  # Cambia esto por el nombre de tu base de datos
$dbUser = "postgres"   # Cambia esto por tu usuario

Write-Host "=== Reseteo de Secuencias de PostgreSQL ===" -ForegroundColor Cyan
Write-Host ""

# Construir el comando SQL
$sqlCommands = @"
SELECT setval(pg_get_serial_sequence('persona', 'p_id'), COALESCE((SELECT MAX(p_id) FROM persona), 1), true);
SELECT setval(pg_get_serial_sequence('producto', 'p_id'), COALESCE((SELECT MAX(p_id) FROM producto), 1), true);
SELECT setval(pg_get_serial_sequence('ubicacion', 'u_id'), COALESCE((SELECT MAX(u_id) FROM ubicacion), 1), true);
SELECT setval(pg_get_serial_sequence('punto_de_venta', 'pv_id'), COALESCE((SELECT MAX(pv_id) FROM punto_de_venta), 1), true);
SELECT setval(pg_get_serial_sequence('venta', 'v_id'), COALESCE((SELECT MAX(v_id) FROM venta), 1), true);
SELECT setval(pg_get_serial_sequence('venta_detalle', 'vd_id'), COALESCE((SELECT MAX(vd_id) FROM venta_detalle), 1), true);
"@

Write-Host "Ejecutando comandos SQL..." -ForegroundColor Yellow
Write-Host ""

# Ejecutar el comando
$env:PGPASSWORD = Read-Host "Ingresa la contraseña de PostgreSQL" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($env:PGPASSWORD)
$env:PGPASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

$sqlCommands | psql -h $dbHost -p $dbPort -U $dbUser -d $dbName

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Secuencias reseteadas exitosamente!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "✗ Error al resetear secuencias" -ForegroundColor Red
}

Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
