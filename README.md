<div align="center">
  style="border-radius: 15px; margin-bottom: 20px;" />

  # 🏨 Sistema de Gestión Hotel San Martín 
  
  **Plataforma robusta, moderna y escalable para la administración integral de reservas, clientes y personal.**

  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)](https://supabase.com/)
</div>

<br />

> [!NOTE] 
> 🌟 **Bienvenido al repositorio oficial.** Este proyecto está diseñado con altos estándares de la industria, proporcionando una arquitectura modular en el Frontend enfocada en el rendimiento y la mantenibilidad.

---

## 🏗️ Arquitectura del Proyecto

Este sistema está desarrollado utilizando tecnologías modernas y sigue una arquitectura modular en el Frontend diseñada para escalar profesionalmente.

### 💻 Stack Tecnológico

| Tecnología | Rol | Descripción |
| :--- | :--- | :--- |
| **`React + Vite`** | Frontend | Framework principal optimizado para UI super rápidas y reactivas. |
| **`TypeScript`** | Tipado | Contratos de interfaces robustos para minimizar errores en desarrollo (*Migrado recientemente*). |
| **`Supabase`** | Backend | Backend-as-a-Service (PostgreSQL, Auth, y Políticas RLS). |
| **`Bcrypt.js`** | Seguridad | Hash de contraseñas local antes de impactar el backend. |

### 📁 Estructura de código
Nuestra arquitectura de directorios sigue las mejores convenciones de aplicaciones Front-end escalables:

```text
src/
├── assets/       # Imágenes, iconos y vectores de la UI (empquetados con Vite)
├── components/   # Componentes UI reutilizables (Botones, Inputs, Modales aislados)
├── context/      # Manejadores de Estado Global (Theme, Auth Context)
├── hooks/        # Custom Hooks (Lógica extraída y reutilizable como useAuth)
├── pages/        # Vistas completas que representan una URL (Routing)
├── services/     # Lógica de conexión externa (Instancia de Supabase, API endpoints)
├── utils/        # Funciones helpers puras (Formateo de fechas, Parsers)
├── App.tsx       # Orquestador principal y enrutador base (React Router)
└── main.tsx      # Entry point de React (Inyección en el DOM)
```

---

## 🚀 Instalación y Ejecución Local

Para correr este proyecto en tu entorno local de desarrollo, sigue los pasos a continuación.

> [!IMPORTANT]
> **Prerrequisitos antes de comenzar**:
> - Tener instalado **Node.js** (v18.x o superior)
> - Tener **npm** o **yarn**
> - Estar agregado al proyecto en **Supabase** (o tener tus propias credenciales)

### Pasos

1. **Clonar e instalar dependencias:**
   Posiciónate en la carpeta del repositorio recién clonado y ejecuta:
   ```bash
   npm install
   ```

2. **Variables de entorno:**
   Crea un archivo `.env` en la raíz del proyecto (a la misma altura que este README). Puedes usar el archivo `.env.example` como guía si está disponible.
   ```env
   VITE_SUPABASE_URL=aqui_viene_tu_url
   VITE_SUPABASE_ANON_KEY=aqui_viene_tu_key
   ```
   > [!WARNING]  
   > *Nunca hagas commit de tu archivo `.env`. Este repositorio ya lo excluye en su `.gitignore` por seguridad.*

3. **Ejecutar el servidor local:**
   Finalmente, levanta el proyecto:
   ```bash
   npm run dev
   ```
   > El proyecto estará disponible por defecto en: `http://localhost:5173/`

---

## 🔒 Estándares y Buenas Prácticas

- **Commit & Git**: El sistema está versionado evitando archivos sensibles mediante un `.gitignore` apropiado.
- **Tipado Fuerte**: Todo el proyecto utiliza **TypeScript**, lo cual previene el 80% de errores comunes en tiempo de compilación.
- **Autenticación Segura**: Sistema de "custom auth" que encripta los passwords desde el cliente usando algoritmos de hashes asimétricos, evitando interceptaciones en texto plano hacia la tabla transaccional.

<br />

<div align="center">
  <i>Desarrollado con para el equipo del Hotel San Martín</i>
</div>