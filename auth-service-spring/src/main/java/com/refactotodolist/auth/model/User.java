package com.refactotodolist.auth.model;

import java.time.Instant;

public record User(
        long id,
        String email,
        String firstName,
        String lastName,
        String passwordHash,
        Instant createdAt) {

    // représentation d'un utilisateur sans le passwordHash, pour les réponses API
    public record Public(long id, String email, String firstName, String lastName, Instant createdAt) {
    }

    // Fonction de mapping pour exposer uniquement les champs publics de l'utilisateur
    public Public toPublic() {
        return new Public(id, email, firstName, lastName, createdAt);
    }
}
