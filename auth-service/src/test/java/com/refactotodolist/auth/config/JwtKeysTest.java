package com.refactotodolist.auth.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.security.KeyPair;

import org.junit.jupiter.api.Test;

import com.refactotodolist.auth.TestKeys;

class JwtKeysTest {

    private static final KeyPair KEYS = TestKeys.generateKeyPair();
    private static final String PRIVATE = TestKeys.toBase64Pem("PRIVATE KEY", KEYS.getPrivate().getEncoded());
    private static final String PUBLIC = TestKeys.toBase64Pem("PUBLIC KEY", KEYS.getPublic().getEncoded());

    @Test
    void clesValides_retourneLesClesRsa() {
        JwtKeys jwtKeys = new JwtKeys(PRIVATE, PUBLIC);

        assertThat(jwtKeys.getPrivateKey().getEncoded()).isEqualTo(KEYS.getPrivate().getEncoded());
        assertThat(jwtKeys.getPublicKey().getEncoded()).isEqualTo(KEYS.getPublic().getEncoded());
        assertThatCode(jwtKeys::validate).doesNotThrowAnyException();
    }

    @Test
    void clePriveeAbsente_erreurExplicite() {
        assertThatThrownBy(() -> new JwtKeys("", PUBLIC).validate())
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("JWT_PRIVATE_KEY is missing in environment");
    }

    @Test
    void clePubliqueAbsente_erreurExplicite() {
        assertThatThrownBy(() -> new JwtKeys(PRIVATE, "  ").validate())
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("JWT_PUBLIC_KEY is missing in environment");
    }

    @Test
    void cleTronquee_erreurExplicite() {
        // Cas réel : clé coupée sur plusieurs lignes dans le .env, seule la 1re ligne est lue
        String tronquee = PRIVATE.substring(0, 146);

        assertThatThrownBy(() -> new JwtKeys(tronquee, PUBLIC).validate())
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("JWT_PRIVATE_KEY is invalid");
    }

    @Test
    void valeurQuiNEstPasDuBase64_erreurExplicite() {
        assertThatThrownBy(() -> new JwtKeys(PRIVATE, "pas du base64 !").validate())
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("JWT_PUBLIC_KEY is invalid");
    }

    @Test
    void clesInversees_erreurExplicite() {
        assertThatThrownBy(() -> new JwtKeys(PUBLIC, PRIVATE).validate())
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("JWT_PRIVATE_KEY is invalid");
    }
}
