package com.refactotodolist.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.refactotodolist.auth.model.User;

class AdminAccountInitializerTest {

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = mock(AuthService.class);
    }

    private AdminAccountInitializer initializer(String email, String password) {
        return new AdminAccountInitializer(authService, email, password);
    }

    private static User user(long id, String role) {
        return new User(id, "admin@test.com", "A", "B", "hash", role, Instant.now());
    }

    @ParameterizedTest
    @CsvSource(value = {
            "'', ''",
            "admin@test.com, ''",
            "'', Password123",
            "'  ', Password123",
            "NULL, Password123",
            "admin@test.com, NULL",
    }, nullValues = "NULL")
    void variablesAbsentes_neFaitRien(String email, String password) {
        initializer(email, password).run(null);

        verifyNoInteractions(authService);
    }

    @Test
    void compteInexistant_creeUnAdminAvecMotDePasseHache() {
        when(authService.getUserByEmail("admin@test.com")).thenReturn(Optional.empty());

        initializer(" Admin@Test.COM ", "Password123").run(null);

        ArgumentCaptor<String> hash = ArgumentCaptor.forClass(String.class);
        verify(authService).createUser(eq("admin@test.com"), eq("Admin"), eq("Admin"), hash.capture(), eq("admin"));
        assertThat(hash.getValue()).isNotEqualTo("Password123");
        assertThat(new BCryptPasswordEncoder().matches("Password123", hash.getValue())).isTrue();
    }

    @Test
    void compteStandardExistant_estPromu() {
        when(authService.getUserByEmail("admin@test.com")).thenReturn(Optional.of(user(3, User.ROLE_STANDARD)));

        initializer("admin@test.com", "Password123").run(null);

        verify(authService).promoteToAdmin(3);
        verify(authService, never()).createUser(anyString(), anyString(), anyString(), anyString(), anyString());
    }

    @Test
    void compteDejaAdmin_rienNeChange() {
        when(authService.getUserByEmail("admin@test.com")).thenReturn(Optional.of(user(3, User.ROLE_ADMIN)));

        initializer("admin@test.com", "Password123").run(null);

        verify(authService, never()).promoteToAdmin(anyLong());
        verify(authService, never()).createUser(anyString(), anyString(), anyString(), anyString(), any());
    }
}
