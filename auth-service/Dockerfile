FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /app

# Cache des dépendances Maven
COPY pom.xml ./
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B -q package -DskipTests

FROM eclipse-temurin:21-jre-alpine AS runtime

ARG VERSION=dev
ARG GIT_SHA=unknown
ARG BUILD_DATE=unknown

LABEL org.opencontainers.image.title="auth-service" \
      org.opencontainers.image.description="Authentification et gestion des utilisateurs (Spring Boot)" \
      org.opencontainers.image.source="https://github.com/Couscoussiere/refacto_to_do_list" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.licenses="MIT" \
      com.refactotodolist.provides.api-version="v1"

RUN apk update && apk upgrade --no-cache && \
    addgroup -S app && adduser -S app -G app

WORKDIR /app

COPY --from=builder /app/target/auth-service.jar ./auth-service.jar

ENV DOCS_ENABLED=false
EXPOSE 3000
USER app
CMD ["java", "-jar", "auth-service.jar"]
