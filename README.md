## API REST Node.js con TypeScript

### Descripción

Esta es una API RESTful desarrollada en Node.js con TypeScript. 

### Características

- Simple CRUD/ABM para artículos y usuarios.
- Autenticación stateless con JWT.
- Implementación de tokens de acceso y refresh, blacklist con Redis.
- Todo validado con Zod schemas.
- MySQL DB
- Testing mediante jest & supertest
 
### Stack/Dependencias Principales

- Node.js
- MySQL
- TypeScript
- Express
- JWT (JSON Web Tokens)
- Redis
- Prisma (ORM)
- MySql2
- Zod
- bcryptjs
- dotenv

### Colección de endpoints (Postman)

Puedes descargar la colección de Postman para probar los endpoints de la API desde el siguiente enlace:

[Descargar colección de Postman](https://github.com/pedroZarza/express-typescript-simple-api/blob/main/endpoint_collection/api-rest-practice%20testing.postman_collection.json) (json)

### .env config

Asegúrate de crear un archivo `.env` en la raíz del proyecto con la siguiente configuración. **Reemplaza los valores entre comillas con los específicos de tu entorno:**

```env
PORT=3030  # Puerto en el que se ejecutará la API

# Configuración de la base de datos
PORT_DB=3306  # Puerto de la base de datos (por defecto MySQL)
HOST_DB="tu-host-db"  # Dirección IP o nombre del host de la base de datos
USER_DB="tu-usuario-db"  # Usuario para la base de datos
PASS_DB="tu-contraseña-db"  # Contraseña para la base de datos
NAME_DB="nombre-db"  # Nombre de la base de datos

# Configuración de JWT
SECRETKEY_JWT="tu-clave-secreta-jwt"  # Clave secreta para firmar los JWT
SECRETKEY_COOKIE="tu-clave-secreta-cookie"  # Clave secreta para las cookies

# Configuración de Redis
REDIS_HOST="localhost"  # Dirección IP o nombre del host de Redis
REDIS_PORT=6379  # Puerto de Redis

# Conexión para Prisma (base de datos)
DATABASE_URL="mysql://USER_DB:PASS_DB@HOST_DB:PORT_DB/NAME_DB?schema=public"  # URL de conexión a la base de datos
```
### DB migrate/push (prisma)

Para gestionar las migraciones de la base de datos con Prisma, sigue estos pasos:

```bash
npx prisma generate
npx prisma db push
```



