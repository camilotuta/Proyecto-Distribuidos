# 📋 Sistema de Validaciones Frontend

Este documento describe todas las validaciones implementadas en el frontend de Node.js para garantizar la integridad de los datos.

## ✅ Validaciones por Campo

### 👤 Personas

#### **Nombre (pNombre)**

- ✓ Obligatorio
- ✓ Mínimo 2 caracteres
- ✓ Máximo 100 caracteres
- ✓ Solo letras y espacios (incluye acentos y ñ)
- ❌ Ejemplos inválidos: `"J"`, `"Juan123"`, `""`

#### **Apellido (pApellido)**

- ✓ Obligatorio
- ✓ Mínimo 2 caracteres
- ✓ Máximo 100 caracteres
- ✓ Solo letras y espacios (incluye acentos y ñ)
- ❌ Ejemplos inválidos: `"P"`, `"Pérez#"`, `""`

#### **Email (pEmail)**

- ✓ Obligatorio
- ✓ Formato válido (debe contener @ y dominio)
- ✓ Máximo 100 caracteres
- ✓ Ejemplos válidos: `juan@gmail.com`, `maria.lopez@empresa.co`
- ❌ Ejemplos inválidos: `"juangmail.com"`, `"juan@"`, `"@gmail.com"`

---

### 📦 Productos

#### **Nombre (pNombre)**

- ✓ Obligatorio
- ✓ Mínimo 2 caracteres
- ✓ Máximo 100 caracteres
- ✓ Solo letras y espacios
- ❌ Ejemplos inválidos: `"P"`, `"Producto123"`, `""`

#### **Precio (pPrecio)**

- ✓ Obligatorio
- ✓ Debe ser mayor a 0
- ✓ Máximo 2 decimales
- ✓ Máximo valor: 999,999,999
- ✓ Ejemplos válidos: `1000`, `1500.50`, `99.99`
- ❌ Ejemplos inválidos: `0`, `-100`, `1500.123` (3 decimales)

#### **Stock (pStock)**

- ✓ Obligatorio
- ✓ Debe ser un número entero (sin decimales)
- ✓ No puede ser negativo
- ✓ Máximo valor: 999,999
- ✓ Ejemplos válidos: `0`, `100`, `1000`
- ❌ Ejemplos inválidos: `-5`, `100.5`, `1000000`

---

### 📍 Ubicaciones

#### **Nombre (uNombre)**

- ✓ Obligatorio
- ✓ Mínimo 2 caracteres
- ✓ Máximo 100 caracteres
- ✓ Solo letras y espacios
- ❌ Ejemplos inválidos: `"B"`, `"Bogotá123"`, `""`

---

### 🏪 Puntos de Venta

#### **Nombre (pvNombre)**

- ✓ Obligatorio
- ✓ Mínimo 2 caracteres
- ✓ Máximo 100 caracteres
- ✓ Solo letras y espacios
- ❌ Ejemplos inválidos: `"S"`, `"Sede1"`, `""`

#### **Ubicación (uId)**

- ✓ Obligatorio
- ✓ Debe seleccionar una ubicación existente
- ❌ Error si no se selecciona ninguna ubicación

---

### 🛒 Ventas

#### **Cliente (pId)**

- ✓ Obligatorio
- ✓ Debe seleccionar un cliente existente
- ❌ Error si no se selecciona ningún cliente

#### **Punto de Venta (pvId)**

- ✓ Obligatorio
- ✓ Debe seleccionar un punto de venta existente
- ❌ Error si no se selecciona ningún punto

#### **Productos (detalles)**

- ✓ Debe agregar al menos un producto
- ✓ Cada producto debe tener:
  - **Producto seleccionado**: No puede estar vacío
  - **Cantidad**: Debe ser mayor a 0
  - **Validación de stock**: La cantidad no puede exceder el stock disponible

**Ejemplo de errores:**

- ❌ `"Debe agregar al menos un producto"` - Si no hay productos en la venta
- ❌ `"Seleccione un producto"` - Si un detalle no tiene producto
- ❌ `"La cantidad debe ser mayor a 0"` - Si la cantidad es 0 o negativa
- ❌ `"Stock insuficiente (disponible: 5)"` - Si pides 10 pero solo hay 5

---

## 🎨 Indicadores Visuales

### Campos con Error

- 🔴 **Borde rojo** en el campo inválido
- ⚠ **Mensaje de error** debajo del campo explicando el problema

### Campos Válidos

- ⚪ **Borde gris** (normal)

### Validación en Tiempo Real

- Las validaciones se ejecutan mientras escribes
- Los mensajes de error aparecen inmediatamente
- Los errores se limpian automáticamente al corregir el campo

---

## 🚀 Cómo Funciona

### 1. **Validación en Tiempo Real**

Cada vez que escribes en un campo, se valida automáticamente:

```javascript
onChange={e => handleFieldChange("pNombre", e.target.value)}
```

### 2. **Validación al Enviar**

Antes de enviar el formulario, se validan todos los campos:

```javascript
const validationErrors = validateForm(form, activeTab);
if (Object.keys(validationErrors).length > 0) {
  alert("Por favor corrige los errores en el formulario");
  return;
}
```

### 3. **Mensajes Claros**

Cada error muestra exactamente qué está mal:

- ✓ "Debe tener al menos 2 caracteres"
- ✓ "Formato de email inválido (ej: usuario@dominio.com)"
- ✓ "Stock insuficiente (disponible: 10)"

---

## 📝 Ejemplos de Uso

### ✅ Crear una Persona Válida

```json
{
  "pNombre": "Juan Carlos",
  "pApellido": "Pérez García",
  "pEmail": "juan.perez@gmail.com"
}
```

### ❌ Crear una Persona Inválida

```json
{
  "pNombre": "J", // ❌ Muy corto
  "pApellido": "Pérez123", // ❌ Contiene números
  "pEmail": "juangmail.com" // ❌ Formato inválido
}
```

### ✅ Crear un Producto Válido

```json
{
  "pNombre": "Laptop Dell",
  "pPrecio": 1500000.5,
  "pStock": 25
}
```

### ❌ Crear un Producto Inválido

```json
{
  "pNombre": "L", // ❌ Muy corto
  "pPrecio": -100, // ❌ Precio negativo
  "pStock": 100.5 // ❌ Stock con decimales
}
```

### ✅ Crear una Venta Válida

```json
{
  "pId": 1,
  "pvId": 1,
  "detalles": [
    {
      "pId": 1,
      "vdCantidad": 2 // ✓ Y hay stock >= 2
    }
  ]
}
```

### ❌ Crear una Venta Inválida

```json
{
  "pId": "", // ❌ Cliente vacío
  "pvId": 1,
  "detalles": [
    {
      "pId": 1,
      "vdCantidad": 100 // ❌ Excede el stock disponible
    }
  ]
}
```

---

## 🔧 Funciones de Validación

### `validateField(fieldName, value)`

Valida un campo individual y retorna el mensaje de error o `null` si es válido.

### `validateForm(formData, entityKey)`

Valida todo el formulario y retorna un objeto con todos los errores encontrados.

### `handleFieldChange(fieldName, value)`

Actualiza el valor del campo y ejecuta validación en tiempo real.

---

## 📞 Soporte

Si encuentras algún problema o necesitas agregar más validaciones:

1. Verifica que el campo esté correctamente mapeado
2. Revisa la función `validateField` en `App.jsx`
3. Asegúrate de que el tipo de input sea correcto (text, number, email, etc.)

---

## 🎯 Beneficios

✅ **Previene errores** antes de llegar al backend  
✅ **Mejora la experiencia del usuario** con mensajes claros  
✅ **Reduce tráfico** al servidor evitando peticiones inválidas  
✅ **Validación de negocio** (ej: stock insuficiente)  
✅ **Interfaz intuitiva** con indicadores visuales

---

**Última actualización:** 11 de noviembre de 2025  
**Versión:** 1.0.0
