# Sistema de Gestión de Tienda - Java Backend + React Frontend

## Descripción

Sistema completo de gestión de tienda con backend en Java Spring Boot y frontend en React + Vite.

## Estructura del Proyecto

```
java/
├── tienda-backend/    # Backend Spring Boot
│   └── src/main/java/co/edu/tienda/
│       ├── domain/
│       │   ├── entities/       # Entidades JPA
│       │   ├── repositories/   # Repositorios
│       │   └── services/       # Servicios de negocio
│       └── infrastructure/
│           └── rest/           # Controladores REST
└── frontend/          # Frontend React
    └── src/
        ├── components/        # Componentes React
        ├── services/         # Servicios API
        └── api/              # Cliente Axios
```

## Requisitos Previos

- **Java 17+** (para el backend)
- **Maven 3.6+** (para construir el backend)
- **Node.js 18+** (para el frontend)
- **PostgreSQL** (base de datos)

## Configuración de Base de Datos

1. Crear la base de datos en PostgreSQL:

```sql
CREATE DATABASE tienda_bd1;
```

2. Las tablas se deben crear manualmente o usar el script SQL correspondiente.

3. Verificar configuración en `tienda-backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/tienda_bd1
spring.datasource.username=postgres
spring.datasource.password=postgres
```

## Instalación y Ejecución

### Backend (Puerto 8080)

1. Navegar a la carpeta del backend:

```bash
cd java/tienda-backend
```

2. Compilar el proyecto:

```bash
mvn clean install
```

3. Ejecutar el backend:

```bash
mvn spring-boot:run
```

O ejecutar el JAR generado:

```bash
java -jar target/tienda-backend-0.0.1-SNAPSHOT.jar
```

El backend estará disponible en: `http://localhost:8080`

### Frontend (Puerto 5173)

1. Navegar a la carpeta del frontend:

```bash
cd java/frontend
```

2. Instalar dependencias:

```bash
npm install
```

3. Ejecutar en modo desarrollo:

```bash
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

## Endpoints del Backend

### Personas

- GET `/api/personas` - Listar todas las personas
- GET `/api/personas/{id}` - Obtener persona por ID
- POST `/api/personas` - Crear nueva persona
- PUT `/api/personas/{id}` - Actualizar persona
- DELETE `/api/personas/{id}` - Eliminar persona

### Productos

- GET `/api/productos` - Listar todos los productos
- GET `/api/productos/{id}` - Obtener producto por ID
- POST `/api/productos` - Crear nuevo producto
- PUT `/api/productos/{id}` - Actualizar producto
- DELETE `/api/productos/{id}` - Eliminar producto

### Ubicaciones

- GET `/api/ubicaciones` - Listar todas las ubicaciones
- GET `/api/ubicaciones/{id}` - Obtener ubicación por ID
- POST `/api/ubicaciones` - Crear nueva ubicación
- PUT `/api/ubicaciones/{id}` - Actualizar ubicación
- DELETE `/api/ubicaciones/{id}` - Eliminar ubicación

### Puntos de Venta

- GET `/api/puntos-de-venta` - Listar todos los puntos de venta
- GET `/api/puntos-de-venta/{id}` - Obtener punto de venta por ID
- POST `/api/puntos-de-venta` - Crear nuevo punto de venta
- PUT `/api/puntos-de-venta/{id}` - Actualizar punto de venta
- DELETE `/api/puntos-de-venta/{id}` - Eliminar punto de venta

### Ventas

- GET `/api/ventas` - Listar todas las ventas
- GET `/api/ventas/{id}` - Obtener venta por ID
- POST `/api/ventas` - Crear nueva venta
- GET `/api/ventas/persona/{personaId}` - Ventas por persona

## Funcionalidades del Frontend

### Opciones de Visualización

Hay dos versiones del frontend disponibles:

1. **App.jsx** (original) - Interfaz todo-en-uno con formularios integrados
2. **App-Components.jsx** (nueva) - Interfaz modular con componentes separados

Para usar la versión con componentes separados, renombrar los archivos:

```bash
mv src/App.jsx src/App-Original.jsx
mv src/App-Components.jsx src/App.jsx
```

### Módulos Disponibles

1. **Personas** - CRUD completo de clientes
2. **Productos** - Gestión de inventario con precios y stock
3. **Ubicaciones** - Gestión de ubicaciones geográficas
4. **Puntos de Venta** - Gestión de puntos de venta asociados a ubicaciones
5. **Ventas** - Creación de ventas con múltiples productos y detalles

## Estructura de Datos

### Persona

```json
{
  "pId": 1,
  "pNombre": "Juan",
  "pApellido": "Pérez",
  "pEmail": "juan@example.com",
  "pTelefono": "1234567890"
}
```

### Producto

```json
{
  "pId": 1,
  "pNombre": "Laptop",
  "pPrecio": 1500000,
  "pStock": 10
}
```

### Venta

```json
{
  "pId": 1,
  "pvId": 1,
  "detalles": [
    {
      "pId": 1,
      "vdCantidad": 2
    }
  ]
}
```

## Solución de Problemas

### Error de CORS

- Verificar que el backend tenga `@CrossOrigin(origins = "*")` en los controladores
- El frontend debe apuntar a `http://localhost:8080/api`

### Error de Conexión a Base de Datos

- Verificar que PostgreSQL esté corriendo
- Verificar credenciales en `application.properties`
- Asegurarse de que la base de datos `tienda_bd1` existe

### Puerto en Uso

- Backend: Cambiar puerto en `application.properties`: `server.port=8081`
- Frontend: Vite asignará otro puerto automáticamente o usar `--port 3000`

## Tecnologías Utilizadas

### Backend

- Spring Boot 3.x
- Spring Data JPA
- PostgreSQL Driver
- Maven

### Frontend

- React 19
- Vite
- Axios
- JavaScript ES6+

## Autor

Proyecto Final - Sistemas Distribuidos
