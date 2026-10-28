# TodoList App — Architecture Microservices

Application de gestion de projets et tâches en architecture microservices.

## Prérequis

- [Node.js](https://nodejs.org/) >= 20
- [npm](https://www.npmjs.com/) >= 9
- [Java](https://adoptium.net/) 21 + [Maven](https://maven.apache.org/) 3.9 (auth-service, Spring Boot)
- [Docker](https://www.docker.com/) + Docker Compose (pour le déploiement complet)

---

## Lancer le projet avec Docker (recommandé)

La méthode la plus simple pour démarrer l'ensemble de la stack.

```bash
docker compose up --build
```

L'application est accessible sur **http://localhost:8080** (reverse-proxy nginx), seul point d'entrée exposé :

| Chemin | Service |
|---|---|
| `/` | Frontend (React) |
| `/v1/auth/` | Auth Service (Java / Spring Boot) |
| `/v1/projects/` | Project Service |
| `/v1/tasks/` | Task Service |
| `/v1/notifications/` | Notification Service (WebSocket) |

Les backends, les bases MySQL et RabbitMQ sont sur un réseau Docker interne (`backend`, `internal: true`) et ne publient aucun port : ils ne sont pas joignables depuis l'extérieur.

Par défaut, la stack démarre en environnement **TEST** (images reconstruites, Swagger activé). Les réglages propres à chaque environnement (port, tag d'image, limites CPU / mémoire…) sont dans `environments/` ; les secrets restent dans `.env` :

```bash
# UAT (port 8081) et PROD (port 80) : images publiées par la CI, sans reconstruction
docker compose --env-file .env --env-file environments/uat.env up -d --no-build
docker compose --env-file .env --env-file environments/prod.env up -d --no-build
```

Pour disposer d'un compte **admin**, renseigner `ADMIN_EMAIL` et `ADMIN_PASSWORD` dans le `.env` racine : l'auth-service crée ce compte au démarrage (ou promeut le compte existant avec cet email). Les comptes créés via l'inscription sont `standard`.

Pour arrêter et nettoyer les volumes :

```bash
docker compose down -v
```

---

## Installation manuelle (développement local)

### 1. Installer les dépendances racine

```bash
npm install
```

### 2. Installer les dépendances de chaque service

```bash
cd project-service && npm install && cd ..
cd task-service && npm install && cd ..
cd notification-service && npm install && cd ..
cd frontend && npm install && cd ..
```

### 3. Variables d'environnement

Chaque service nécessite les variables suivantes (à créer dans un fichier `.env` dans chaque dossier de service) :

**auth-service/.env**
```env
PORT=3000
JWT_PRIVATE_KEY=<clé privée RSA en base64>
JWT_PUBLIC_KEY=<clé publique RSA en base64>
JWT_EXPIRES_IN=1d
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=auth_db
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<mot de passe admin>
```

> L'auth-service (Spring Boot) lit ces variables depuis l'environnement : les exporter dans le shell avant `mvn spring-boot:run`.

Les JWT sont signés en **RS256** : la clé privée signe, la clé publique vérifie. Pour générer une paire de clés et afficher les deux lignes à copier dans `auth-service/.env` (et dans le `.env` racine pour Docker) :

```bash
node -e "const {generateKeyPairSync}=require('crypto');const k=generateKeyPairSync('rsa',{modulusLength:2048,privateKeyEncoding:{type:'pkcs8',format:'pem'},publicKeyEncoding:{type:'spki',format:'pem'}});console.log('JWT_PRIVATE_KEY='+Buffer.from(k.privateKey).toString('base64'));console.log('JWT_PUBLIC_KEY='+Buffer.from(k.publicKey).toString('base64'))"
```

> Chaque valeur doit tenir sur **une seule ligne**. En production, utiliser une paire différente, stockée dans les secrets GitHub `JWT_PRIVATE_KEY` et `JWT_PUBLIC_KEY`.

**project-service/.env**
```env
PORT=3001
AUTH_SERVICE_URL=http://localhost:3000
TASK_SERVICE_URL=http://localhost:3002
RABBITMQ_URL=amqp://localhost:5672
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=project_db
```

**task-service/.env**
```env
PORT=3002
PROJECT_SERVICE_URL=http://localhost:3001
RABBITMQ_URL=amqp://localhost:5672
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=task_db
```

**notification-service/.env**
```env
PORT=3003
RABBITMQ_URL=amqp://localhost:5672
```

### 4. Initialiser les bases de données

Créer les bases de données MySQL et exécuter les schémas SQL (l'auth-service applique lui-même ses migrations `auth-service/src/main/resources/db/migrations` au démarrage) :

```bash
mysql -u root -p < project-service/sql/migrations/schema.sql
mysql -u root -p < task-service/sql/schema.sql
```

### 5. Compiler et lancer chaque service

```bash
# Auth Service (Spring Boot)
cd auth-service
mvn spring-boot:run
cd ..

# Project Service
cd project-service
npm run build
npm start
cd ..

# Task Service
cd task-service
npm run build
npm start
cd ..

# Notification Service
cd notification-service
npm run build
npm start
cd ..
```

### 6. Lancer le frontend

```bash
npm run frontend:dev
```

Accessible sur http://localhost:5173

---

## Tests

### Tests unitaires — par service

Depuis le dossier de chaque service (JUnit/Maven pour l'auth-service, Vitest pour les autres) :

```bash
# Auth Service (Java)
cd auth-service && mvn test
# sans Java installé :
# docker run --rm -v "$PWD:/app" -w /app maven:3.9-eclipse-temurin-21 mvn -B test

# Project Service
cd project-service && npm test

# Task Service
cd task-service && npm test

# Notification Service
cd notification-service && npm test
```

### Tests E2E (Playwright)

Les tests E2E nécessitent que la stack complète soit démarrée (via Docker ou manuellement).

Installer les navigateurs Playwright (première fois) :

```bash
npx playwright install
```

Lancer les tests :

```bash
npm run test:e2e
```

Les tests sont exécutés sur Chromium, Firefox et WebKit. Le rapport HTML est généré dans `playwright-report/`.

Pour afficher le rapport après les tests :

```bash
npx playwright show-report
```

---

## Qualité du code

### Lint (ESLint)

```bash
npm run lint
```

### Lint architecture (Dependency Cruiser)

Vérifie le respect des frontières entre microservices :

```bash
npm run lint:architecture
```

---

## Build TypeScript (racine)

```bash
npm run build
```

Compile le TypeScript vers `dist/`.

---

## Structure du projet

```
.
├── auth-service/          # Authentification JWT + comptes standard/admin (Java / Spring Boot)
├── project-service/       # Gestion des projets (CRUD + RabbitMQ)
├── task-service/          # Gestion des tâches (CRUD + RabbitMQ)
├── notification-service/  # Notifications temps réel (WebSocket + RabbitMQ)
├── frontend/              # Application React (Vite)
├── nginx/                 # Configuration du reverse proxy
├── tests/                 # Tests E2E Playwright
└── docker-compose.yml     # Orchestration complète
```
