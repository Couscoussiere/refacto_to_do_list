package com.refactotodolist.auth.model;

import java.time.Instant;

public record User(
        long id,
        String email,
        String firstName,
        String lastName,
        String passwordHash,
        String role,
        Instant createdAt) {

    public static final String ROLE_STANDARD = "standard";
    public static final String ROLE_ADMIN = "admin";

    public boolean isAdmin() {
        return ROLE_ADMIN.equals(role);
    }

    // représentation d'un utilisateur sans le passwordHash, pour les réponses API
    public record Public(long id, String email, String firstName, String lastName, String role, Instant createdAt) {
    }

    // Fonction de mapping pour exposer uniquement les champs publics de l'utilisateur
    public Public toPublic() {
        return new Public(id, email, firstName, lastName, role, createdAt);
    }
}
