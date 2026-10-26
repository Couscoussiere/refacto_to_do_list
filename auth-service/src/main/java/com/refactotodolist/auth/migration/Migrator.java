package com.refactotodolist.auth.migration;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

// Même mécanisme que la version Node (table schema_migrations, fichiers VXXX__*.sql)
// pour rester compatible avec une base déjà migrée par l'ancien service.
@Component
public class Migrator {

    private static final String MIGRATIONS_LOCATION = "classpath:db/migrations/*.sql";

    private final JdbcTemplate jdbc;

    public Migrator(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // Exécuté avant le démarrage du serveur HTTP
    @PostConstruct
    public void runMigrations() throws IOException {
        Resource[] resources = new PathMatchingResourcePatternResolver().getResources(MIGRATIONS_LOCATION);
        applyMigrations(Arrays.asList(resources));
    }

    public void applyMigrations(List<Resource> resources) throws IOException {
        jdbc.execute("""
                CREATE TABLE IF NOT EXISTS schema_migrations (
                  version VARCHAR(255) NOT NULL,
                  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  PRIMARY KEY (version)
                )
                """);

        List<Resource> files = resources.stream()
                .filter(r -> r.getFilename() != null && r.getFilename().endsWith(".sql"))
                .sorted(Comparator.comparing(Resource::getFilename))
                .toList();

        for (Resource file : files) {
            String version = file.getFilename();
            Integer applied = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM schema_migrations WHERE version = ?", Integer.class, version);
            if (applied != null && applied > 0) continue;

            String sql = file.getContentAsString(StandardCharsets.UTF_8);
            for (String stmt : sql.split(";")) {
                String trimmed = stmt.trim();
                if (!trimmed.isEmpty()) jdbc.execute(trimmed);
            }

            jdbc.update("INSERT INTO schema_migrations (version) VALUES (?)", version);
            System.out.println("[migrate] Applied: " + version);
        }
    }
}
