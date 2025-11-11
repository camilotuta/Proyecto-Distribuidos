-- Script para resetear las secuencias de PostgreSQL
-- Ejecutar esto en tu base de datos PostgreSQL cuando haya problemas de "duplicate key"

-- Resetear secuencia de PERSONA
SELECT setval(pg_get_serial_sequence('persona', 'p_id'), COALESCE(MAX(p_id), 1), true) FROM persona;

-- Resetear secuencia de PRODUCTO
SELECT setval(pg_get_serial_sequence('producto', 'p_id'), COALESCE(MAX(p_id), 1), true) FROM producto;

-- Resetear secuencia de UBICACION
SELECT setval(pg_get_serial_sequence('ubicacion', 'u_id'), COALESCE(MAX(u_id), 1), true) FROM ubicacion;

-- Resetear secuencia de PUNTO_DE_VENTA
SELECT setval(pg_get_serial_sequence('punto_de_venta', 'pv_id'), COALESCE(MAX(pv_id), 1), true) FROM punto_de_venta;

-- Resetear secuencia de VENTA
SELECT setval(pg_get_serial_sequence('venta', 'v_id'), COALESCE(MAX(v_id), 1), true) FROM venta;

-- Resetear secuencia de VENTA_DETALLE (este es el que está causando el problema)
SELECT setval(pg_get_serial_sequence('venta_detalle', 'vd_id'), COALESCE(MAX(vd_id), 1), true) FROM venta_detalle;

-- Verificar el estado de las secuencias
SELECT 'persona' as tabla, currval(pg_get_serial_sequence('persona', 'p_id')) as valor_actual
UNION ALL
SELECT 'producto', currval(pg_get_serial_sequence('producto', 'p_id'))
UNION ALL
SELECT 'ubicacion', currval(pg_get_serial_sequence('ubicacion', 'u_id'))
UNION ALL
SELECT 'punto_de_venta', currval(pg_get_serial_sequence('punto_de_venta', 'pv_id'))
UNION ALL
SELECT 'venta', currval(pg_get_serial_sequence('venta', 'v_id'))
UNION ALL
SELECT 'venta_detalle', currval(pg_get_serial_sequence('venta_detalle', 'vd_id'));
