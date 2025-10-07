package com.devwonder.authservice.service;

import org.springframework.stereotype.Service;

import java.security.*;
import java.security.interfaces.RSAPublicKey;
import java.util.*;
import java.security.spec.RSAPublicKeySpec;
import java.math.BigInteger;
import jakarta.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class JwksService {

    private static final Logger logger = LoggerFactory.getLogger(JwksService.class);

    // RSA key configuration constants
    private static final int RSA_KEY_SIZE = 2048;
    private static final String RSA_ALGORITHM = "RSA";
    private static final String JWT_ALGORITHM = "RS256";
    private static final String KEY_TYPE = "RSA";
    private static final String KEY_USE = "sig";

    // Array manipulation constants
    private static final int LEADING_ZERO_BYTE = 0;
    private static final int MINIMUM_ARRAY_LENGTH = 1;

    private KeyPair keyPair;
    private String keyId;

    @PostConstruct
    public void init() {
        generateKeyPair();
    }

    private void generateKeyPair() {
        try {
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance(RSA_ALGORITHM);
            keyPairGenerator.initialize(RSA_KEY_SIZE);
            this.keyPair = keyPairGenerator.generateKeyPair();
            this.keyId = UUID.randomUUID().toString();
            logger.info("Generated new RSA key pair with ID: {}", keyId);
        } catch (NoSuchAlgorithmException e) {
            logger.error("Failed to generate RSA key pair", e);
            throw new RuntimeException("Failed to generate RSA key pair", e);
        }
    }

    public Map<String, Object> getJwks() {
        RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
        
        Map<String, Object> key = new HashMap<>();
        key.put("kty", KEY_TYPE);
        key.put("use", KEY_USE);
        key.put("kid", keyId);
        key.put("alg", JWT_ALGORITHM);
        key.put("n", encodeToBase64URL(publicKey.getModulus()));
        key.put("e", encodeToBase64URL(publicKey.getPublicExponent()));

        Map<String, Object> jwks = new HashMap<>();
        jwks.put("keys", Collections.singletonList(key));

        return jwks;
    }

    public PrivateKey getPrivateKey() {
        return keyPair.getPrivate();
    }

    public PublicKey getPublicKey() {
        return keyPair.getPublic();
    }

    public String getKeyId() {
        return keyId;
    }

    private String encodeToBase64URL(BigInteger bigInteger) {
        byte[] bytes = bigInteger.toByteArray();
        
        // Remove leading zero byte if present (for positive numbers)
        if (bytes.length > MINIMUM_ARRAY_LENGTH && bytes[0] == LEADING_ZERO_BYTE) {
            byte[] tmp = new byte[bytes.length - 1];
            System.arraycopy(bytes, 1, tmp, 0, tmp.length);
            bytes = tmp;
        }
        
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}