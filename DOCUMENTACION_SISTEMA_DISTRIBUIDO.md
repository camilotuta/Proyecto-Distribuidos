# 📚 Documentación del Sistema Distribuido

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Arquitectura del Sistema Distribuido](#arquitectura-del-sistema-distribuido)
3. [Componentes del Sistema](#componentes-del-sistema)
4. [Configuración de la Base de Datos](#configuración-de-la-base-de-datos)
5. [Backend Java - Spring Boot](#backend-java---spring-boot)
6. [Backend Node.js - Express](#backend-nodejs---express)
7. [Comunicación y Sincronización](#comunicación-y-sincronización)
8. [Replicación de Datos](#replicación-de-datos)
9. [APIs RESTful](#apis-restful)
10. [Manejo de Concurrencia](#manejo-de-concurrencia)
11. [Escalabilidad y Disponibilidad](#escalabilidad-y-disponibilidad)

---

## 🎯 Introducción

Este proyecto implementa un **sistema distribuido** para la gestión de una tienda, con dos backends independientes que operan sobre la misma base de datos PostgreSQL utilizando **replicación maestro-esclavo**.

### Características del Sistema Distribuido

- **Múltiples nodos de procesamiento**: Backend Java y Backend Node.js
- **Base de datos compartida con replicación**: PostgreSQL con replicación física
- **Arquitectura de microservicios**: Componentes independientes y desacoplados
- **Balanceo de carga potencial**: Cada backend puede manejar diferentes tipos de peticiones
- **Alta disponibilidad**: Si un backend falla, el otro puede continuar operando
- **Escalabilidad horizontal**: Posibilidad de agregar más nodos según demanda

---

## 🏗️ Arquitectura del Sistema Distribuido

```
┌─────────────────────────────────────────────────────────────┐
│                     CAPA DE PRESENTACIÓN                     │
├──────────────────────────┬──────────────────────────────────┤
│   Frontend React (Java)  │   Frontend React (Node)          │
│   Puerto: 5173           │   Puerto: 5174                   │
│   Tema: Verde 🌿         │   Tema: Azul 💎                  │
└──────────────┬───────────┴──────────────┬───────────────────┘
               │                          │
               │ HTTP/REST                │ HTTP/REST
               │                          │
┌──────────────▼──────────────────────────▼───────────────────┐
│                   CAPA DE APLICACIÓN                         │
├──────────────────────────┬──────────────────────────────────┤
│  Backend Java            │  Backend Node.js                 │
│  Spring Boot             │  Express + Sequelize             │
│  Puerto: 8080            │  Puerto: 3000                    │
│  ORM: Hibernate/JPA      │  ORM: Sequelize                  │
└──────────────┬───────────┴──────────────┬───────────────────┘
               │                          │
               │ JDBC                     │ pg (node-postgres)
               │                          │
┌──────────────▼──────────────────────────▼───────────────────┐
│                  CAPA DE PERSISTENCIA                        │
├──────────────────────────────────────────────────────────────┤
│              PostgreSQL - Base de Datos Distribuida          │
│                                                              │
│  ┌─────────────────┐         ┌─────────────────┐           │
│  │  Nodo Maestro   │────────▶│  Nodo Esclavo   │           │
│  │  (Read/Write)   │ Replic. │  (Read Only)    │           │
│  │  Puerto: 5432   │         │  Puerto: 5433   │           │
│  └─────────────────┘         └─────────────────┘           │
└──────────────────────────────────────────────────────────────┘
```

### Ventajas de esta Arquitectura

1. **Separación de Responsabilidades**: Cada componente tiene un propósito específico
2. **Tecnologías Heterogéneas**: Diferentes tecnologías para diferentes necesidades
3. **Tolerancia a Fallos**: Si un backend falla, el otro continúa funcionando
4. **Distribución de Carga**: Las peticiones se pueden distribuir entre backends
5. **Escalabilidad Independiente**: Cada componente puede escalar por separado

---

## 🔧 Componentes del Sistema

### 1. Backend Java (Spring Boot)

**Ubicación**: `java/tienda-backend/`

**Tecnologías**:

- Java 17+
- Spring Boot 3.x
- Spring Data JPA (Hibernate)
- PostgreSQL Driver
- Maven

**Características Distribuidas**:

- Gestión automática de conexiones con pool de conexiones (HikariCP)
- Transacciones ACID con JPA
- Caché de segundo nivel (opcional con EhCache/Redis)
- Stateless (sin estado en servidor)

### 2. Backend Node.js (Express)

**Ubicación**: `node/backend/`

**Tecnologías**:

- Node.js 18+
- Express.js
- Sequelize ORM
- pg (node-postgres)
- dotenv

**Características Distribuidas**:

- Event Loop no bloqueante para alta concurrencia
- Connection pooling con pg-pool
- Transacciones con Sequelize
- Middleware para logging y manejo de errores

### 3. Base de Datos PostgreSQL

**Características de Distribución**:

- Replicación física (Streaming Replication)
- Nodo maestro para escrituras
- Nodo(s) esclavo(s) para lecturas
- WAL (Write-Ahead Logging)
- Hot Standby para consultas en réplicas

---

## 🗄️ Configuración de la Base de Datos

### Configuración del Nodo Maestro

**Archivo**: `postgresql.conf` (Maestro)

```ini
# Configuración para replicación
wal_level = replica
max_wal_senders = 10
max_replication_slots = 10
hot_standby = on
archive_mode = on
archive_command = 'test ! -f /var/lib/postgresql/archive/%f && cp %p /var/lib/postgresql/archive/%f'
```

### Configuración del Nodo Esclavo

**Archivo**: `postgresql.conf` (Esclavo)

```ini
# Configuración para réplica
hot_standby = on
max_standby_streaming_delay = 30s
wal_receiver_status_interval = 10s
hot_standby_feedback = on
```

**Archivo**: `recovery.conf` (Esclavo)

```ini
standby_mode = 'on'
primary_conninfo = 'host=192.168.1.10 port=5432 user=replicator password=rep_password'
trigger_file = '/tmp/postgresql.trigger.5432'
```

### Script de Inicialización

**Archivo**: `java/tienda-backend/src/main/resources/schema.sql`

```sql
-- Creación de tablas con consideraciones para sistema distribuido

-- Tabla de Personas
CREATE TABLE IF NOT EXISTS personas (
    p_id SERIAL PRIMARY KEY,
    p_nombre VARCHAR(100) NOT NULL,
    p_apellido VARCHAR(100) NOT NULL,
    p_email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Productos
CREATE TABLE IF NOT EXISTS productos (
    p_id SERIAL PRIMARY KEY,
    p_nombre VARCHAR(100) NOT NULL,
    p_precio DECIMAL(10,2) NOT NULL CHECK (p_precio >= 0),
    p_stock INTEGER NOT NULL DEFAULT 0 CHECK (p_stock >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Ubicaciones
CREATE TABLE IF NOT EXISTS ubicaciones (
    u_id SERIAL PRIMARY KEY,
    u_nombre VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Puntos de Venta
CREATE TABLE IF NOT EXISTS puntos_de_venta (
    pv_id SERIAL PRIMARY KEY,
    pv_nombre VARCHAR(100) NOT NULL,
    u_id INTEGER REFERENCES ubicaciones(u_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Ventas
CREATE TABLE IF NOT EXISTS ventas (
    v_id SERIAL PRIMARY KEY,
    p_id INTEGER REFERENCES personas(p_id) ON DELETE CASCADE,
    pv_id INTEGER REFERENCES puntos_de_venta(pv_id) ON DELETE CASCADE,
    v_fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    v_total DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Detalles de Venta
CREATE TABLE IF NOT EXISTS venta_detalles (
    vd_id SERIAL PRIMARY KEY,
    v_id INTEGER REFERENCES ventas(v_id) ON DELETE CASCADE,
    p_id INTEGER REFERENCES productos(p_id) ON DELETE CASCADE,
    vd_cantidad INTEGER NOT NULL CHECK (vd_cantidad > 0),
    vd_precio_unitario DECIMAL(10,2) NOT NULL,
    vd_subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento en sistema distribuido
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(v_fecha);
CREATE INDEX IF NOT EXISTS idx_ventas_cliente ON ventas(p_id);
CREATE INDEX IF NOT EXISTS idx_venta_detalles_venta ON venta_detalles(v_id);
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON productos(p_nombre);
CREATE INDEX IF NOT EXISTS idx_personas_email ON personas(p_email);

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at automáticamente
CREATE TRIGGER update_personas_updated_at BEFORE UPDATE ON personas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Consideraciones para Sistemas Distribuidos

1. **SERIAL vs UUID**: Usamos SERIAL para IDs secuenciales, pero en sistemas altamente distribuidos se recomienda UUID para evitar conflictos
2. **Timestamps**: `created_at` y `updated_at` para auditoría y sincronización
3. **Índices**: Mejoran el rendimiento de lecturas en réplicas
4. **Constraints**: Garantizan integridad incluso con múltiples backends
5. **Cascadas**: ON DELETE CASCADE para mantener consistencia referencial

---

## ☕ Backend Java - Spring Boot

### Estructura del Proyecto

```
tienda-backend/
├── src/main/java/co/edu/tienda/
│   ├── TiendaBackendApplication.java
│   ├── domain/
│   │   ├── entities/          # Entidades JPA
│   │   ├── repositories/      # Repositorios
│   │   └── services/          # Lógica de negocio
│   ├── infrastructure/rest/   # Controladores REST
│   └── web/rest/              # Configuración web
└── src/main/resources/
    └── application.properties # Configuración
```

### Configuración de Conexión

**Archivo**: `application.properties`

```properties
# Configuración de la base de datos - Nodo Maestro (Escritura y Lectura)
spring.datasource.url=jdbc:postgresql://localhost:5432/tienda_db
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.datasource.driver-class-name=org.postgresql.Driver

# Pool de Conexiones HikariCP (Optimizado para sistemas distribuidos)
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000

# JPA/Hibernate
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true

# Configuración de logging
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE

# Server
server.port=8080
server.servlet.context-path=/

# CORS (para permitir múltiples frontends)
cors.allowed-origins=http://localhost:5173,http://localhost:5174
```

### Entidad JPA - Ejemplo

**Archivo**: `Persona.java`

```java
package co.edu.tienda.domain.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "personas")
public class Persona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "p_id")
    private Long id;

    @Column(name = "p_nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "p_apellido", nullable = false, length = 100)
    private String apellido;

    @Column(name = "p_email", unique = true, length = 100)
    private String email;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Método para inicializar timestamps
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters y Setters
    // ... (omitidos por brevedad)
}
```

**Características para Sistemas Distribuidos**:

- `@Version` para control de concurrencia optimista (opcional)
- Timestamps para auditoría
- `@PrePersist` y `@PreUpdate` para mantener metadatos
- Validaciones a nivel de entidad

### Repositorio JPA

**Archivo**: `PersonaRepository.java`

```java
package co.edu.tienda.domain.repositories;

import co.edu.tienda.domain.entities.Persona;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PersonaRepository extends JpaRepository<Persona, Long> {

    // Consulta personalizada para búsqueda
    @Query("SELECT p FROM Persona p WHERE " +
           "LOWER(p.nombre) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.apellido) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Persona> searchPersonas(String searchTerm);

    // Búsqueda por email único
    Optional<Persona> findByEmail(String email);

    // Verificar existencia por email
    boolean existsByEmail(String email);
}
```

**Ventajas en Sistemas Distribuidos**:

- Queries optimizadas con JPA
- Caché de consultas (segundo nivel)
- Transacciones automáticas
- Pool de conexiones gestionado

### Servicio con Transacciones

**Archivo**: `PersonaService.java`

```java
package co.edu.tienda.domain.services;

import co.edu.tienda.domain.entities.Persona;
import co.edu.tienda.domain.repositories.PersonaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Isolation;
import java.util.List;

@Service
public class PersonaService {

    @Autowired
    private PersonaRepository personaRepository;

    // Lectura (puede ir a réplica)
    @Transactional(readOnly = true)
    public List<Persona> findAll() {
        return personaRepository.findAll();
    }

    // Escritura (debe ir a maestro)
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public Persona save(Persona persona) {
        // Validaciones de negocio
        if (persona.getEmail() != null &&
            personaRepository.existsByEmail(persona.getEmail())) {
            throw new RuntimeException("Email ya existe");
        }
        return personaRepository.save(persona);
    }

    // Actualización con manejo de concurrencia
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public Persona update(Long id, Persona personaActualizada) {
        Persona persona = personaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Persona no encontrada"));

        persona.setNombre(personaActualizada.getNombre());
        persona.setApellido(personaActualizada.getApellido());
        persona.setEmail(personaActualizada.getEmail());

        return personaRepository.save(persona);
    }

    // Eliminación
    @Transactional
    public void delete(Long id) {
        if (!personaRepository.existsById(id)) {
            throw new RuntimeException("Persona no encontrada");
        }
        personaRepository.deleteById(id);
    }
}
```

**Niveles de Aislamiento en Sistemas Distribuidos**:

- `READ_COMMITTED`: Previene lecturas sucias
- `REPEATABLE_READ`: Previene lecturas no repetibles
- `SERIALIZABLE`: Máximo aislamiento (puede afectar rendimiento)
- `readOnly = true`: Permite routing a réplicas de lectura

### Controlador REST

**Archivo**: `PersonaController.java`

```java
package co.edu.tienda.infrastructure.rest;

import co.edu.tienda.domain.entities.Persona;
import co.edu.tienda.domain.services.PersonaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/personas")
@CrossOrigin(origins = "*") // En producción, especificar orígenes
public class PersonaController {

    @Autowired
    private PersonaService personaService;

    // GET - Listar todas
    @GetMapping
    public ResponseEntity<List<Persona>> findAll() {
        return ResponseEntity.ok(personaService.findAll());
    }

    // GET - Buscar por ID
    @GetMapping("/{id}")
    public ResponseEntity<Persona> findById(@PathVariable Long id) {
        return ResponseEntity.ok(personaService.findById(id));
    }

    // POST - Crear
    @PostMapping
    public ResponseEntity<Persona> create(@RequestBody Persona persona) {
        try {
            Persona saved = personaService.save(persona);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // PUT - Actualizar
    @PutMapping("/{id}")
    public ResponseEntity<Persona> update(
            @PathVariable Long id,
            @RequestBody Persona persona) {
        try {
            Persona updated = personaService.update(id, persona);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // DELETE - Eliminar
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            personaService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
```

**Características REST para Distribución**:

- Stateless: Sin sesión en servidor
- CORS configurado para múltiples frontends
- Códigos HTTP estándar
- Formato JSON para interoperabilidad
- Idempotencia en operaciones

---

## 🟢 Backend Node.js - Express

### Estructura del Proyecto

```
backend/
├── server.js              # Punto de entrada
├── src/
│   ├── app.js            # Configuración de Express
│   ├── config/
│   │   └── database.js   # Configuración de Sequelize
│   ├── models/           # Modelos Sequelize
│   ├── controllers/      # Controladores
│   └── routes/           # Rutas
└── .env                  # Variables de entorno
```

### Configuración de Conexión

**Archivo**: `.env`

```env
# Configuración de Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tienda_db
DB_USER=postgres
DB_PASSWORD=postgres

# Configuración del Servidor
PORT=3000
NODE_ENV=development

# Pool de Conexiones
DB_POOL_MAX=20
DB_POOL_MIN=5
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000
```

**Archivo**: `database.js`

```javascript
const { Sequelize } = require("sequelize");
require("dotenv").config();

// Configuración de Sequelize con pool de conexiones
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",

    // Pool de conexiones para alta concurrencia
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 20,
      min: parseInt(process.env.DB_POOL_MIN) || 5,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
    },

    // Logging
    logging: process.env.NODE_ENV === "development" ? console.log : false,

    // Timezone
    timezone: "-05:00",

    // Opciones adicionales para sistemas distribuidos
    dialectOptions: {
      statement_timeout: 30000, // Timeout de 30 segundos
      idle_in_transaction_session_timeout: 60000,
    },

    // Retry automático
    retry: {
      max: 3,
      timeout: 3000,
    },
  }
);

// Test de conexión
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Conexión a PostgreSQL establecida correctamente");
  })
  .catch((err) => {
    console.error("❌ Error al conectar a PostgreSQL:", err);
  });

module.exports = sequelize;
```

### Modelo Sequelize - Ejemplo

**Archivo**: `Persona.js`

```javascript
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Persona = sequelize.define(
  "Persona",
  {
    pId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "p_id",
    },
    pNombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "p_nombre",
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
    },
    pApellido: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "p_apellido",
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
    },
    pEmail: {
      type: DataTypes.STRING(100),
      unique: true,
      field: "p_email",
      validate: {
        isEmail: true,
      },
    },
  },
  {
    tableName: "personas",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",

    // Hooks para auditoría
    hooks: {
      beforeCreate: (persona, options) => {
        console.log(`🆕 Creando persona: ${persona.pNombre}`);
      },
      afterCreate: (persona, options) => {
        console.log(`✅ Persona creada con ID: ${persona.pId}`);
      },
      beforeUpdate: (persona, options) => {
        console.log(`📝 Actualizando persona ID: ${persona.pId}`);
      },
    },
  }
);

module.exports = Persona;
```

### Controlador con Transacciones

**Archivo**: `personaController.js`

```javascript
const { Op } = require("sequelize");
const Persona = require("../models/Persona");
const sequelize = require("../config/database");

// GET - Listar todas las personas
exports.findAll = async (req, res) => {
  try {
    const personas = await Persona.findAll({
      order: [["pId", "ASC"]],
    });
    res.json(personas);
  } catch (error) {
    console.error("Error al obtener personas:", error);
    res.status(500).json({
      error: "Error al obtener personas",
      message: error.message,
    });
  }
};

// GET - Buscar por ID
exports.findById = async (req, res) => {
  try {
    const { id } = req.params;
    const persona = await Persona.findByPk(id);

    if (!persona) {
      return res.status(404).json({ error: "Persona no encontrada" });
    }

    res.json(persona);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST - Crear persona con transacción
exports.create = async (req, res) => {
  const transaction = await sequelize.transaction({
    isolationLevel: sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED,
  });

  try {
    const { pNombre, pApellido, pEmail } = req.body;

    // Validaciones
    if (!pNombre || !pApellido) {
      throw new Error("Nombre y apellido son obligatorios");
    }

    // Verificar email único
    if (pEmail) {
      const existe = await Persona.findOne({
        where: { pEmail },
        transaction,
      });
      if (existe) {
        throw new Error("El email ya está registrado");
      }
    }

    // Crear persona dentro de la transacción
    const persona = await Persona.create(
      {
        pNombre,
        pApellido,
        pEmail,
      },
      { transaction }
    );

    // Commit de la transacción
    await transaction.commit();

    res.status(201).json(persona);
  } catch (error) {
    // Rollback en caso de error
    await transaction.rollback();

    console.error("Error al crear persona:", error);
    res.status(400).json({
      error: "Error al crear persona",
      message: error.message,
    });
  }
};

// PUT - Actualizar persona con concurrencia optimista
exports.update = async (req, res) => {
  const transaction = await sequelize.transaction({
    isolationLevel: sequelize.Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
  });

  try {
    const { id } = req.params;
    const { pNombre, pApellido, pEmail } = req.body;

    // Buscar persona con bloqueo
    const persona = await Persona.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!persona) {
      throw new Error("Persona no encontrada");
    }

    // Verificar email único si cambió
    if (pEmail && pEmail !== persona.pEmail) {
      const existe = await Persona.findOne({
        where: {
          pEmail,
          pId: { [Op.ne]: id },
        },
        transaction,
      });
      if (existe) {
        throw new Error("El email ya está registrado");
      }
    }

    // Actualizar
    await persona.update(
      {
        pNombre: pNombre || persona.pNombre,
        pApellido: pApellido || persona.pApellido,
        pEmail: pEmail || persona.pEmail,
      },
      { transaction }
    );

    await transaction.commit();

    res.json(persona);
  } catch (error) {
    await transaction.rollback();

    res.status(400).json({
      error: "Error al actualizar persona",
      message: error.message,
    });
  }
};

// DELETE - Eliminar persona
exports.delete = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const persona = await Persona.findByPk(id, { transaction });

    if (!persona) {
      throw new Error("Persona no encontrada");
    }

    await persona.destroy({ transaction });
    await transaction.commit();

    res.status(204).send();
  } catch (error) {
    await transaction.rollback();

    res.status(400).json({
      error: "Error al eliminar persona",
      message: error.message,
    });
  }
};

// Búsqueda con filtros
exports.search = async (req, res) => {
  try {
    const { q } = req.query;

    const personas = await Persona.findAll({
      where: {
        [Op.or]: [
          { pNombre: { [Op.iLike]: `%${q}%` } },
          { pApellido: { [Op.iLike]: `%${q}%` } },
          { pEmail: { [Op.iLike]: `%${q}%` } },
        ],
      },
      order: [["pId", "ASC"]],
    });

    res.json(personas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Rutas Express

**Archivo**: `personaRoutes.js`

```javascript
const express = require("express");
const router = express.Router();
const personaController = require("../controllers/personaController");

// Middleware de logging
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Rutas CRUD
router.get("/", personaController.findAll);
router.get("/search", personaController.search);
router.get("/:id", personaController.findById);
router.post("/", personaController.create);
router.put("/:id", personaController.update);
router.delete("/:id", personaController.delete);

module.exports = router;
```

### Aplicación Principal

**Archivo**: `app.js`

```javascript
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");

// Importar modelos
const Persona = require("./models/Persona");
const Producto = require("./models/Producto");
const Ubicacion = require("./models/Ubicacion");
const PuntoDeVenta = require("./models/PuntoDeVenta");
const Venta = require("./models/Venta");
const VentaDetalle = require("./models/VentaDetalle");

// Importar rutas
const personaRoutes = require("./routes/personaRoutes");
const productoRoutes = require("./routes/productoRoutes");
const ubicacionRoutes = require("./routes/ubicacionRoutes");
const puntoDeVentaRoutes = require("./routes/puntoDeVentaRoutes");
const ventaRoutes = require("./routes/ventaRoutes");

const app = express();

// Middlewares
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging de requests
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} - ${res.statusCode} [${duration}ms]`
    );
  });
  next();
});

// Rutas
app.use("/api/personas", personaRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/ubicaciones", ubicacionRoutes);
app.use("/api/puntos-de-venta", puntoDeVentaRoutes);
app.use("/api/ventas", ventaRoutes);

// Ruta de health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: "Connected",
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error("Error no manejado:", err);
  res.status(500).json({
    error: "Error interno del servidor",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Sincronización de modelos y relaciones
sequelize
  .sync({ alter: false })
  .then(() => {
    console.log("✅ Modelos sincronizados con la base de datos");
  })
  .catch((err) => {
    console.error("❌ Error al sincronizar modelos:", err);
  });

module.exports = app;
```

**Archivo**: `server.js`

```javascript
const app = require("./src/app");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log("╔════════════════════════════════════════╗");
  console.log("║  🚀 Servidor Node.js Iniciado         ║");
  console.log("╠════════════════════════════════════════╣");
  console.log(`║  Puerto: ${PORT}                          ║`);
  console.log(`║  URL: http://localhost:${PORT}            ║`);
  console.log(`║  API: http://localhost:${PORT}/api        ║`);
  console.log(`║  Health: http://localhost:${PORT}/health  ║`);
  console.log("╚════════════════════════════════════════╝");
});

// Manejo de señales de terminación
process.on("SIGTERM", () => {
  console.log("⚠️  SIGTERM recibido. Cerrando servidor...");
  server.close(() => {
    console.log("✅ Servidor cerrado correctamente");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("\n⚠️  SIGINT recibido. Cerrando servidor...");
  server.close(() => {
    console.log("✅ Servidor cerrado correctamente");
    process.exit(0);
  });
});
```

---

## 🔄 Comunicación y Sincronización

### Protocolo REST

Ambos backends implementan APIs RESTful siguiendo los mismos endpoints:

```
GET    /api/personas          - Listar todas
GET    /api/personas/:id      - Obtener por ID
POST   /api/personas          - Crear nueva
PUT    /api/personas/:id      - Actualizar
DELETE /api/personas/:id      - Eliminar
```

### Headers HTTP Importantes

```http
Content-Type: application/json
Accept: application/json
X-Request-ID: <uuid>           # Para trazabilidad
X-Correlation-ID: <uuid>       # Para correlación entre servicios
```

### Formato de Respuesta Estándar

**Éxito**:

```json
{
  "data": { ... },
  "timestamp": "2025-11-11T12:00:00Z",
  "status": 200
}
```

**Error**:

```json
{
  "error": "Mensaje de error",
  "message": "Detalles adicionales",
  "timestamp": "2025-11-11T12:00:00Z",
  "status": 400
}
```

---

## 🔁 Replicación de Datos

### Estrategia de Replicación

1. **Maestro-Esclavo (Master-Slave)**

   - Maestro: Maneja TODAS las escrituras
   - Esclavo(s): Maneja lecturas (Read Replicas)

2. **Streaming Replication**

   ```
   Maestro (Write) ──WAL Stream──> Esclavo (Read)
   ```

3. **Ventajas**:
   - Mejora rendimiento de lecturas
   - Alta disponibilidad
   - Backups automáticos
   - Distribución geográfica

### Configuración de Routing

**Java - application.properties**:

```properties
# Datasource principal (Maestro)
spring.datasource.url=jdbc:postgresql://master-host:5432/tienda_db

# Datasource de lectura (Esclavo) - Opcional
spring.datasource.read.url=jdbc:postgresql://slave-host:5433/tienda_db
```

**Node - database.js**:

```javascript
const replication = {
  read: [
    { host: "slave1-host", port: 5433 },
    { host: "slave2-host", port: 5434 },
  ],
  write: { host: "master-host", port: 5432 },
};

const sequelize = new Sequelize({
  replication,
  // ... otras opciones
});
```

### Lag de Replicación

Monitoreo del retraso:

```sql
-- En el maestro
SELECT client_addr, state, sent_lsn, write_lsn, flush_lsn, replay_lsn
FROM pg_stat_replication;

-- En el esclavo
SELECT now() - pg_last_xact_replay_timestamp() AS replication_lag;
```

---

## 🌐 APIs RESTful

### Endpoints Principales

#### Personas

```
GET    /api/personas
POST   /api/personas
GET    /api/personas/:id
PUT    /api/personas/:id
DELETE /api/personas/:id
```

#### Productos

```
GET    /api/productos
POST   /api/productos
GET    /api/productos/:id
PUT    /api/productos/:id
DELETE /api/productos/:id
```

#### Ventas (Operación Compleja)

```
GET    /api/ventas
POST   /api/ventas              # Crea venta + detalles (transacción)
GET    /api/ventas/:id
PUT    /api/ventas/:id
DELETE /api/ventas/:id
GET    /api/ventas/:id/detalles # Obtener detalles de una venta
```

### Ejemplo de Transacción Compleja: Crear Venta

**Java**:

```java
@Service
public class VentaService {

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public Venta crearVenta(VentaRequest request) {
        // 1. Crear la venta
        Venta venta = new Venta();
        venta.setPersona(personaRepo.findById(request.getPersonaId())
            .orElseThrow());
        venta.setPuntoDeVenta(pvRepo.findById(request.getPuntoVentaId())
            .orElseThrow());

        // 2. Procesar detalles
        BigDecimal total = BigDecimal.ZERO;
        for (VentaDetalleDTO detalle : request.getDetalles()) {
            // Verificar stock
            Producto producto = productoRepo.findById(detalle.getProductoId())
                .orElseThrow();

            if (producto.getStock() < detalle.getCantidad()) {
                throw new RuntimeException("Stock insuficiente");
            }

            // Reducir stock
            producto.setStock(producto.getStock() - detalle.getCantidad());
            productoRepo.save(producto);

            // Crear detalle
            VentaDetalle vd = new VentaDetalle();
            vd.setVenta(venta);
            vd.setProducto(producto);
            vd.setCantidad(detalle.getCantidad());
            vd.setPrecioUnitario(producto.getPrecio());
            vd.setSubtotal(producto.getPrecio()
                .multiply(BigDecimal.valueOf(detalle.getCantidad())));

            venta.getDetalles().add(vd);
            total = total.add(vd.getSubtotal());
        }

        venta.setTotal(total);
        return ventaRepo.save(venta);
    }
}
```

**Node**:

```javascript
exports.create = async (req, res) => {
  const transaction = await sequelize.transaction({
    isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
  });

  try {
    const { pId, pvId, detalles } = req.body;

    // 1. Crear venta
    const venta = await Venta.create(
      {
        pId,
        pvId,
        vTotal: 0,
      },
      { transaction }
    );

    // 2. Procesar detalles
    let total = 0;
    for (const detalle of detalles) {
      // Verificar stock con bloqueo
      const producto = await Producto.findByPk(detalle.pId, {
        transaction,
        lock: Transaction.LOCK.UPDATE,
      });

      if (!producto) {
        throw new Error(`Producto ${detalle.pId} no encontrado`);
      }

      if (producto.pStock < detalle.vdCantidad) {
        throw new Error(`Stock insuficiente para ${producto.pNombre}`);
      }

      // Reducir stock
      await producto.update(
        {
          pStock: producto.pStock - detalle.vdCantidad,
        },
        { transaction }
      );

      // Crear detalle
      const subtotal = producto.pPrecio * detalle.vdCantidad;
      await VentaDetalle.create(
        {
          vId: venta.vId,
          pId: producto.pId,
          vdCantidad: detalle.vdCantidad,
          vdPrecioUnitario: producto.pPrecio,
          vdSubtotal: subtotal,
        },
        { transaction }
      );

      total += subtotal;
    }

    // 3. Actualizar total
    await venta.update({ vTotal: total }, { transaction });

    await transaction.commit();

    // 4. Retornar venta completa
    const ventaCompleta = await Venta.findByPk(venta.vId, {
      include: [
        { model: Persona },
        { model: PuntoDeVenta },
        { model: VentaDetalle, include: [Producto] },
      ],
    });

    res.status(201).json(ventaCompleta);
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ error: error.message });
  }
};
```

---

## ⚡ Manejo de Concurrencia

### Estrategias Implementadas

#### 1. Control de Concurrencia Optimista

**Usando @Version en JPA**:

```java
@Entity
public class Producto {
    @Id
    private Long id;

    @Version
    private Long version;

    // Si dos transacciones intentan modificar,
    // la segunda falla con OptimisticLockException
}
```

#### 2. Control de Concurrencia Pesimista

**Bloqueo de filas**:

```java
// Java
@Lock(LockModeType.PESSIMISTIC_WRITE)
Producto producto = productoRepo.findById(id);
```

```javascript
// Node
const producto = await Producto.findByPk(id, {
  lock: Transaction.LOCK.UPDATE,
});
```

#### 3. Niveles de Aislamiento

| Nivel            | Java                              | Node                              | Uso                   |
| ---------------- | --------------------------------- | --------------------------------- | --------------------- |
| READ_UNCOMMITTED | ISOLATION_LEVELS.READ_UNCOMMITTED | ISOLATION_LEVELS.READ_UNCOMMITTED | Lecturas no críticas  |
| READ_COMMITTED   | ISOLATION_LEVELS.READ_COMMITTED   | ISOLATION_LEVELS.READ_COMMITTED   | Por defecto           |
| REPEATABLE_READ  | ISOLATION_LEVELS.REPEATABLE_READ  | ISOLATION_LEVELS.REPEATABLE_READ  | Lecturas consistentes |
| SERIALIZABLE     | ISOLATION_LEVELS.SERIALIZABLE     | ISOLATION_LEVELS.SERIALIZABLE     | Máxima consistencia   |

### Ejemplo: Prevenir Sobreventa

```javascript
// Operación atómica con bloqueo
const venderProducto = async (productoId, cantidad) => {
  const transaction = await sequelize.transaction({
    isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
  });

  try {
    // 1. Bloquear fila del producto
    const producto = await Producto.findByPk(productoId, {
      transaction,
      lock: Transaction.LOCK.UPDATE,
    });

    // 2. Verificar stock
    if (producto.pStock < cantidad) {
      throw new Error("Stock insuficiente");
    }

    // 3. Reducir stock (operación atómica)
    await producto.decrement("pStock", {
      by: cantidad,
      transaction,
    });

    // 4. Commit
    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
```

---

## 📈 Escalabilidad y Disponibilidad

### Estrategias de Escalabilidad

#### 1. Escalabilidad Horizontal

```
                    Load Balancer (Nginx)
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
    Backend 1          Backend 2          Backend 3
    (Java:8080)        (Node:3000)        (Java:8081)
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    Database Cluster
                  (Master + Read Replicas)
```

#### 2. Configuración de Nginx

```nginx
upstream backend_java {
    least_conn;
    server localhost:8080 weight=3;
    server localhost:8081 weight=2;
    server localhost:8082 weight=1;
}

upstream backend_node {
    least_conn;
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}

server {
    listen 80;

    location /api/java/ {
        proxy_pass http://backend_java/api/;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /api/node/ {
        proxy_pass http://backend_node/api/;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

#### 3. Health Checks

**Java**:

```java
@RestController
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now());
        health.put("service", "java-backend");
        health.put("version", "1.0.0");
        return ResponseEntity.ok(health);
    }
}
```

**Node**:

```javascript
app.get("/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: "UP",
      timestamp: new Date().toISOString(),
      service: "node-backend",
      version: "1.0.0",
      database: "Connected",
    });
  } catch (error) {
    res.status(503).json({
      status: "DOWN",
      error: error.message,
    });
  }
});
```

### Alta Disponibilidad

#### 1. Configuración de Failover

```yaml
# docker-compose.yml para alta disponibilidad
version: "3.8"

services:
  postgres-master:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - master-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  postgres-slave1:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_MASTER_HOST: postgres-master
    volumes:
      - slave1-data:/var/lib/postgresql/data
    ports:
      - "5433:5432"
    depends_on:
      - postgres-master

  backend-java-1:
    build: ./java/tienda-backend
    ports:
      - "8080:8080"
    environment:
      DB_HOST: postgres-master
    depends_on:
      - postgres-master
    restart: unless-stopped

  backend-java-2:
    build: ./java/tienda-backend
    ports:
      - "8081:8080"
    environment:
      DB_HOST: postgres-master
    depends_on:
      - postgres-master
    restart: unless-stopped

  backend-node-1:
    build: ./node/backend
    ports:
      - "3000:3000"
    environment:
      DB_HOST: postgres-master
    depends_on:
      - postgres-master
    restart: unless-stopped

  backend-node-2:
    build: ./node/backend
    ports:
      - "3001:3000"
    environment:
      DB_HOST: postgres-slave1
    depends_on:
      - postgres-slave1
    restart: unless-stopped

volumes:
  master-data:
  slave1-data:
```

#### 2. Circuit Breaker Pattern

**Java con Resilience4j**:

```java
@Service
public class ProductoService {

    @CircuitBreaker(name = "productoService", fallbackMethod = "fallbackGetProductos")
    @RateLimiter(name = "productoService")
    @Retry(name = "productoService")
    public List<Producto> getProductos() {
        return productoRepository.findAll();
    }

    // Método de fallback
    public List<Producto> fallbackGetProductos(Exception e) {
        log.warn("Circuit breaker activado: {}", e.getMessage());
        return Collections.emptyList();
    }
}
```

#### 3. Caché Distribuida

**Redis para caché compartido**:

```java
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        return RedisCacheManager.create(connectionFactory);
    }
}

@Service
public class ProductoService {

    @Cacheable(value = "productos", key = "#id")
    public Producto findById(Long id) {
        return productoRepository.findById(id).orElseThrow();
    }

    @CacheEvict(value = "productos", key = "#producto.id")
    public Producto update(Producto producto) {
        return productoRepository.save(producto);
    }
}
```

---

## 🔍 Monitoreo y Logging

### Logging Estructurado

**Java con SLF4J**:

```java
@Slf4j
@RestController
public class PersonaController {

    @PostMapping
    public ResponseEntity<Persona> create(@RequestBody Persona persona) {
        log.info("Creando persona: nombre={}, email={}",
                 persona.getNombre(), persona.getEmail());

        try {
            Persona saved = personaService.save(persona);
            log.info("Persona creada exitosamente: id={}", saved.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            log.error("Error al crear persona: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
```

**Node con Winston**:

```javascript
const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Uso en controladores
exports.create = async (req, res) => {
  logger.info("Creando persona", { body: req.body });

  try {
    const persona = await Persona.create(req.body);
    logger.info("Persona creada", { id: persona.pId });
    res.status(201).json(persona);
  } catch (error) {
    logger.error("Error al crear persona", { error: error.message });
    res.status(400).json({ error: error.message });
  }
};
```

### Métricas y Monitoreo

**Prometheus + Grafana**:

```javascript
const promClient = require("prom-client");

// Contador de requests
const httpRequestsTotal = new promClient.Counter({
  name: "http_requests_total",
  help: "Total de requests HTTP",
  labelNames: ["method", "route", "status"],
});

// Histograma de latencia
const httpRequestDuration = new promClient.Histogram({
  name: "http_request_duration_seconds",
  help: "Duración de requests HTTP",
  labelNames: ["method", "route"],
});

app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestsTotal.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode,
    });
    httpRequestDuration.observe(
      {
        method: req.method,
        route: req.route?.path || req.path,
      },
      duration
    );
  });

  next();
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
```

---

## 🎓 Conclusiones

Este sistema distribuido demuestra:

1. **Arquitectura de Microservicios**: Backends independientes con tecnologías diferentes
2. **Replicación de Datos**: PostgreSQL con maestro-esclavo para alta disponibilidad
3. **Transacciones Distribuidas**: Manejo ACID en ambos backends
4. **Escalabilidad**: Capacidad de agregar más nodos según demanda
5. **Tolerancia a Fallos**: Si un componente falla, otros continúan operando
6. **APIs RESTful**: Comunicación estándar entre componentes
7. **Concurrencia**: Manejo de múltiples usuarios simultáneos
8. **Monitoring**: Logs, métricas y health checks

### Ventajas del Sistema

- ✅ Alta disponibilidad
- ✅ Escalabilidad horizontal
- ✅ Diversidad tecnológica
- ✅ Separación de responsabilidades
- ✅ Fácil mantenimiento
- ✅ Performance optimizado

### Posibles Mejoras

- 🔄 Implementar Message Queue (RabbitMQ/Kafka)
- 🔄 Service Discovery (Consul/Eureka)
- 🔄 API Gateway (Kong/Zuul)
- 🔄 Caché distribuida (Redis)
- 🔄 Tracing distribuido (Jaeger/Zipkin)

---

## 📚 Referencias

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Replication](https://www.postgresql.org/docs/current/runtime-config-replication.html)
- [Microservices Patterns](https://microservices.io/patterns/)
- [The Twelve-Factor App](https://12factor.net/)

---

**Fecha de documentación**: Noviembre 2025  
**Versión**: 1.0.0  
**Autores**: Equipo de Desarrollo
