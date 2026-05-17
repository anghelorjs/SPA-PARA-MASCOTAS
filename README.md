# 🐾 SPA Mascotas - Sistema de Gestión Integral

[![Laravel Version](https://img.shields.io/badge/Laravel-11.x-red.svg)](https://laravel.com)
[![React Version](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org)
[![PHP Version](https://img.shields.io/badge/PHP-8.2+-purple.svg)](https://php.net)
[![MySQL Version](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://mysql.com)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38bdf8.svg)](https://tailwindcss.com)

## 📋 Tabla de Contenidos

- [🐾 SPA Mascotas - Sistema de Gestión Integral](#-spa-mascotas---sistema-de-gestión-integral)
  - [📋 Tabla de Contenidos](#-tabla-de-contenidos)
  - [🚀 Descripción General](#-descripción-general)
    - [🎯 Objetivos del Sistema](#-objetivos-del-sistema)
    - [🔐 Seguridad Implementada](#-seguridad-implementada)
  - [📦 Módulos Desarrollados](#-módulos-desarrollados)
    - [👑 Módulo Administrador](#-módulo-administrador)
    - [📞 Módulo Recepcionista](#-módulo-recepcionista)
    - [✂️ Módulo Groomer](#️-módulo-groomer)
    - [🐾 Módulo Cliente](#-módulo-cliente)
  - [🛠️ Tecnologías Utilizadas](#️-tecnologías-utilizadas)
    - [Backend](#backend)
    - [Frontend](#frontend)
    - [Dependencias de Desarrollo](#dependencias-de-desarrollo)

---

## 🚀 Descripción General

**SPA Mascotas** es un sistema web integral para la gestión de centros de grooming, tiendas de mascotas y spa canino. La plataforma permite administrar citas, servicios de grooming, ventas de productos, gestión de clientes y mascotas, todo desde una interfaz moderna y responsive.

### 🎯 Objetivos del Sistema

- **Optimizar la gestión de citas** mediante un calendario interactivo con slots por groomer
- **Estandarizar los procesos de grooming** con fichas digitales, checklist e insumos
- **Mejorar la experiencia del cliente** con autogestión de citas e historial de servicios
- **Centralizar la información** de clientes, mascotas, productos y ventas
- **Generar reportes ejecutivos** para la toma de decisiones

---
└─────────────────────────────────────────────────────────────────────────────┘


### 🔐 Seguridad Implementada

| Característica | Estado | Descripción |
|----------------|--------|-------------|
| Autenticación JWT | ✅ | Tokens seguros con Laravel Sanctum |
| Middleware por Rol | ✅ | Protección de rutas por rol de usuario |
| Captcha en Login | ✅ | Protección contra ataques de fuerza bruta |
| Bloqueo de cuenta | ✅ | 5 intentos fallidos = bloqueo 15 min |
| Cierre por inactividad | ✅ | 30 minutos sin actividad → cierre sesión |
| Contraseñas fuertes | ✅ | Validación: 8+ chars, mayúsculas, minúsculas, números |
| Activación por email | ✅ | Token firmado con expiración de 15 minutos |
| Trazabilidad (Logs) | ✅ | Registro completo de acciones del sistema |

---

## 📦 Módulos Desarrollados

### 👑 Módulo Administrador

| Módulo | Estado | Funcionalidades |
|--------|--------|-----------------|
| **Dashboard** | ✅ Completado | KPIs, gráficas, top servicios/productos, alertas stock |
| **Agenda** | ✅ Completado | Calendario, disponibilidad groomers, servicios, rangos peso |
| **Grooming** | ✅ Completado | Fichas, checklist, insumos, galería de fotos |
| **Clientes** | ✅ Completado | CRUD clientes, historial, mascotas |
| **Catálogo** | ✅ Completado | Productos, variantes, insumos, categorías, movimientos |
| **Reportes** | ✅ Completado | Agenda, ingresos, inventario, clientes (4 tipos) |
| **Configuración** | ✅ Completado | Datos negocio, usuarios, notificaciones, trazabilidad |
| **Perfil** | ✅ Completado | Datos personales, cambio contraseña |

### 📞 Módulo Recepcionista

| Módulo | Estado | Funcionalidades |
|--------|--------|-----------------|
| **Dashboard** | ✅ Completado | KPIs, estado groomers, alertas 30 min, citas del día |
| **Agenda** | ✅ Completado | Calendario, wizard 5 pasos, slots libres, gestión citas |
| **Clientes** | ✅ Completado | CRUD clientes, mascotas, historial |
| **Ventas** | ✅ Completado | Registro ventas, carrito, facturación, medio pago |
| **Notificaciones** | ✅ Completado | Listado, envío manual, reenvío, filtros |
| **Perfil** | ✅ Completado | Datos personales, resumen día, cambio contraseña |

### ✂️ Módulo Groomer

| Módulo | Estado | Funcionalidades |
|--------|--------|-----------------|
| **Dashboard** | ✅ Completado | Citas del día, próximas citas, recomendaciones |
| **Mi Agenda** | ✅ Completado | Lista de citas, historial mascota, iniciar servicio |
| **Fichas** | ✅ Completado | Estado ingreso, checklist, insumos, fotos, cerrar ficha |
| **Perfil** | ✅ Completado | Datos personales, cambio contraseña |

### 🐾 Módulo Cliente

| Módulo | Estado | Funcionalidades |
|--------|--------|-----------------|
| **Dashboard** | ✅ Completado | Próxima cita, notificaciones, recomendaciones |
| **Mis Mascotas** | ✅ Completado | CRUD mascotas, galería, historial servicios |
| **Mis Citas** | ✅ Completado | Agendar, cancelar, confirmar, historial |
| **Catálogo** | ✅ Completado | Productos, carrito, pedido WhatsApp/Telegram |
| **Mi Historial** | ✅ Completado | Servicios, compras, detalle |
| **Perfil** | ✅ Completado | Datos personales, notificaciones, cambio contraseña |

---

## 🛠️ Tecnologías Utilizadas

### Backend

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Laravel | 11.x | Framework principal |
| PHP | 8.2+ | Lenguaje backend |
| MySQL | 8.0+ | Base de datos relacional |
| Laravel Sanctum | - | Autenticación con tokens |
| JWT | - | Tokens firmados para activación |
| Laravel Socialite | - | OAuth con Google |
| Gregwar/Captcha | - | Captcha en login |
| Mailtrap | - | Pruebas de envío de emails |
| PHPUnit | - | Pruebas unitarias |

### Frontend

| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 18.x | Framework frontend |
| TypeScript | 5.x | Tipado estático |
| Vite | 5.x | Build tool |
| TailwindCSS | 3.x | Estilos y diseño |
| React Router | 6.x | Navegación |
| Axios | - | Cliente HTTP |
| FullCalendar | - | Calendario de citas |
| React Icons | - | Iconografía |
| Heroicons | - | Iconos adicionales |

### Dependencias de Desarrollo

```json
{
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}