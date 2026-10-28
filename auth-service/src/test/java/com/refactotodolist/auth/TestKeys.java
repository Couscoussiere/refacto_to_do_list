package com.refactotodolist.auth;

import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.util.Base64;

import com.refactotodolist.auth.config.JwtKeys;

// Paires RSA éphémères pour les tests unitaires : aucune clé n'est commitée
public final class TestKeys {

    private TestKeys() {
    }

    public static KeyPair generateKeyPair() {
        try {
            KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
            generator.initialize(2048);
            return generator.generateKeyPair();
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    // Même format que les variables JWT_PRIVATE_KEY / JWT_PUBLIC_KEY : PEM encodé en base64 sur une ligne
    public static String toBase64Pem(String type, byte[] der) {
        String pem = "-----BEGIN " + type + "-----\n"
                + Base64.getMimeEncoder(64, "\n".getBytes(StandardCharsets.UTF_8)).encodeToString(der)
                + "\n-----END " + type + "-----\n";
        return Base64.getEncoder().encodeToString(pem.getBytes(StandardCharsets.UTF_8));
    }

    public static JwtKeys jwtKeys(KeyPair keys) {
        return new JwtKeys(
                toBase64Pem("PRIVATE KEY", keys.getPrivate().getEncoded()),
                toBase64Pem("PUBLIC KEY", keys.getPublic().getEncoded()));
    }
}
