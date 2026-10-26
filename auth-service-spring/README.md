# auth-service (Spring Boot)

Réécriture en Java 21 / Spring Boot 3.5 de `auth-service` (Node/Express). Même API, mêmes variables d'environnement, même base : les deux versions sont interchangeables.

## Endpoints

| Méthode | Route               | Description                                  |
| ------- | ------------------- | -------------------------------------------- |
| GET     | `/health`           | `{ "status": "ok" }`                         |
| POST    | `/v1/auth/register` | Inscription → `201 { user, token }`          |
| POST    | `/v1/auth/login`    | Connexion → `200 { user, token }`            |
| GET     | `/v1/auth/me`       | Profil (header `Authorization: Bearer …`)    |
| GET     | `/v1/docs`          | Swagger UI (désactivé si `DOCS_ENABLED=false`) |

## Variables d'environnement

`PORT`, `CORS_ORIGIN`, `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY` (PEM en base64, RS256), `JWT_EXPIRES_IN`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DOCS_ENABLED`.

## Compatibilité avec la version Node

- Migrations : même table `schema_migrations` et mêmes fichiers (`src/main/resources/db/migrations`), une base déjà migrée n'est pas touchée.
- Mots de passe : les hash bcrypt `$2b$` créés par Node sont acceptés.
- JWT : mêmes claims (`sub`, `email`, `iat`, `exp`), vérifiables par l'une ou l'autre version.

## Lancer

```bash
# Tests (sans Java installé)
docker run --rm -v "$PWD:/app" -w /app maven:3.9-eclipse-temurin-21 mvn -B test

# Image
docker build -t auth-service-spring .
```

Pour l'utiliser dans `docker-compose.yml`, remplacer le `build` du service `auth-service` par :

```yaml
build:
    context: ./auth-service-spring
```
