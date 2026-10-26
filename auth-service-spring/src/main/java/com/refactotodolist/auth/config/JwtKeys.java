package com.refactotodolist.auth.config;

import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

// Les clés PEM sont stockées en base64 sur une seule ligne dans le .env
@Component
public class JwtKeys {

    public static final String JWT_ALGORITHM = "RS256";

    private final String privateKeyEnv;
    private final String publicKeyEnv;

    public JwtKeys(@Value("${app.jwt.private-key}") String privateKeyEnv,
                   @Value("${app.jwt.public-key}") String publicKeyEnv) {
        this.privateKeyEnv = privateKeyEnv;
        this.publicKeyEnv = publicKeyEnv;
    }

    public RSAPrivateKey getPrivateKey() {
        byte[] der = pemToDer(readPemFromEnv("JWT_PRIVATE_KEY", privateKeyEnv));
        try {
            return (RSAPrivateKey) KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(der));
        } catch (Exception e) {
            throw new IllegalStateException("JWT_PRIVATE_KEY is invalid", e);
        }
    }

    public RSAPublicKey getPublicKey() {
        byte[] der = pemToDer(readPemFromEnv("JWT_PUBLIC_KEY", publicKeyEnv));
        try {
            return (RSAPublicKey) KeyFactory.getInstance("RSA").generatePublic(new X509EncodedKeySpec(der));
        } catch (Exception e) {
            throw new IllegalStateException("JWT_PUBLIC_KEY is invalid", e);
        }
    }

    private static String readPemFromEnv(String name, String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(name + " is missing in environment");
        }
        return new String(Base64.getMimeDecoder().decode(value.trim()), StandardCharsets.UTF_8);
    }

    private static byte[] pemToDer(String pem) {
        String body = pem.replaceAll("-----(BEGIN|END) [A-Z ]+-----", "").replaceAll("\\s", "");
        return Base64.getDecoder().decode(body);
    }
}
