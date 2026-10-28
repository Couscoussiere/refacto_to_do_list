# auth-service (Spring Boot)

Service d'authentification en Java 21 / Spring Boot 3.5 : inscription, connexion, JWT RS256, rôles `standard` / `admin` et suppression de comptes.

## Endpoints

| Méthode | Route                    | Description                                               |
| ------- | ------------------------ | --------------------------------------------------------- |
| GET     | `/health`                | `{ "status": "ok" }`                                      |
| POST    | `/v1/auth/register`      | Inscription (rôle `standard`) → `201 { user, token }`     |
| POST    | `/v1/auth/login`         | Connexion → `200 { user, token }`                         |
| GET     | `/v1/auth/me`            | Profil (header `Authorization: Bearer …`)                 |
| DELETE  | `/v1/auth/me`            | Supprime son propre compte (standard ou admin) → `204`    |
| GET     | `/v1/auth/users`         | Liste des comptes (admin uniquement)                      |
| DELETE  | `/v1/auth/users/{id}`    | Supprime un compte **standard** (admin uniquement) → `204` |
| GET     | `/v1/docs`               | Swagger UI (désactivé si `DOCS_ENABLED=false`)            |

Le rôle est inclus dans le JWT (`role`) mais les routes admin le revérifient en base : un admin rétrogradé perd ses droits immédiatement.

## Variables d'environnement

`PORT`, `CORS_ORIGIN`, `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY` (PEM en base64, RS256), `JWT_EXPIRES_IN`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DOCS_ENABLED`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.

Si `ADMIN_EMAIL` et `ADMIN_PASSWORD` sont définis, le compte admin est créé au démarrage (ou le compte existant est promu admin).

## Migrations

Fichiers `VXXX__*.sql` dans `src/main/resources/db/migrations`, appliqués au démarrage et tracés dans la table `schema_migrations`.

## Tests

- **Unitaires** (JUnit 5 + Mockito, sans Spring ni base) : `JwtKeysTest`, `AuthServiceTest`, `AdminAccountInitializerTest`, `RequireAuthInterceptorTest`, `UserTest`.
- **Intégration** (`AuthControllerTest`) : contexte Spring complet + MockMvc + base H2 en mémoire, couvre toutes les routes HTTP.

## Lancer

```bash
# Tests
mvn test
# sans Java installé
docker run --rm -v "$PWD:/app" -w /app maven:3.9-eclipse-temurin-21 mvn -B test

# Image
docker build -t auth-service .
```
