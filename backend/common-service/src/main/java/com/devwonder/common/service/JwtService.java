package com.devwonder.common.service;

import com.devwonder.common.exception.InvalidTokenSignatureException;
import com.devwonder.common.exception.JwksRetrievalException;
import com.devwonder.common.exception.JwtValidationException;
import com.devwonder.common.exception.TokenExpiredException;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.RSASSAVerifier;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URL;
import java.time.Instant;
import java.util.List;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    @Value("${nexhub.jwt.jwks-uri:http://auth-service:8081/auth/.well-known/jwks.json}")
    private String jwksUri;

    public JWTClaimsSet validateToken(String token) throws JwtValidationException {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            JWTClaimsSet claimsSet = signedJWT.getJWTClaimsSet();
            
            if (claimsSet.getExpirationTime() != null &&
                claimsSet.getExpirationTime().before(java.util.Date.from(Instant.now()))) {
                throw new TokenExpiredException("Token expired");
            }
            
            RSAKey rsaKey = getRSAKey(signedJWT.getHeader().getKeyID());
            JWSVerifier verifier = new RSASSAVerifier(rsaKey);
            
            if (!signedJWT.verify(verifier)) {
                throw new InvalidTokenSignatureException("Invalid token signature");
            }
            
            log.debug("Token validated successfully for user: {}", claimsSet.getSubject());
            return claimsSet;
            
        } catch (JwtValidationException e) {
            log.error("Token validation failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Token validation failed: {}", e.getMessage());
            throw new JwtValidationException("Token validation failed", e);
        }
    }

    private RSAKey getRSAKey(String keyId) throws JwksRetrievalException {
        try {
            JWKSet jwkSet = JWKSet.load(new URL(jwksUri));
            JWK jwk = jwkSet.getKeyByKeyId(keyId);
            
            if (jwk == null) {
                throw new JwksRetrievalException("Key not found: " + keyId);
            }
            
            return jwk.toRSAKey();
            
        } catch (JwksRetrievalException e) {
            log.error("Failed to get RSA key: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Failed to get RSA key: {}", e.getMessage());
            throw new JwksRetrievalException("Failed to get RSA key", e);
        }
    }

    public String extractUsername(JWTClaimsSet claimsSet) {
        try {
            // Auth service stores username in 'subject' field
            return claimsSet.getSubject();
        } catch (Exception e) {
            log.warn("Failed to extract username from token: {}", e.getMessage());
            return null;
        }
    }

    public Long extractAccountId(JWTClaimsSet claimsSet) {
        try {
            // Auth service stores accountId in 'userId' claim
            return claimsSet.getLongClaim("userId");
        } catch (Exception e) {
            log.warn("Failed to extract accountId from token: {}", e.getMessage());
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    public List<String> extractRoles(JWTClaimsSet claimsSet) {
        try {
            return (List<String>) claimsSet.getClaim("roles");
        } catch (Exception e) {
            log.warn("Failed to extract roles from token: {}", e.getMessage());
            return List.of();
        }
    }
}