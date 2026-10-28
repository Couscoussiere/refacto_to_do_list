package com.refactotodolist.auth.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

class UserTest {

    private static final Instant CREATED_AT = Instant.parse("2026-01-01T10:00:00Z");

    private static User user(String role) {
        return new User(1, "olivier@test.com", "Olivier", "Dick", "$2a$10$hash", role, CREATED_AT);
    }

    @Test
    void isAdmin() {
        assertThat(user(User.ROLE_ADMIN).isAdmin()).isTrue();
        assertThat(user(User.ROLE_STANDARD).isAdmin()).isFalse();
    }

    @Test
    void toPublic_copieLesChampsPublics() {
        User.Public pub = user(User.ROLE_ADMIN).toPublic();

        assertThat(pub).isEqualTo(new User.Public(1, "olivier@test.com", "Olivier", "Dick", "admin", CREATED_AT));
    }

    @Test
    void toPublic_nExposeJamaisLeHashEnJson() throws Exception {
        ObjectMapper mapper = new ObjectMapper().registerModule(new JavaTimeModule());

        String json = mapper.writeValueAsString(user(User.ROLE_STANDARD).toPublic());

        assertThat(json).doesNotContain("password").doesNotContain("$2a$10$hash");
        assertThat(json).contains("\"role\":\"standard\"");
    }
}
