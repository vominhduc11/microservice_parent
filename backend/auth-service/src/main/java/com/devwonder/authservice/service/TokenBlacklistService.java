package com.devwonder.authservice.service;

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Date;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenBlacklistService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final AuthJwtService jwtService;

    // Blacklist configuration constants
    private static final String BLACKLIST_KEY_PREFIX = "auth:blacklist:";
    private static final long MILLISECONDS_IN_SECOND = 1000;
    
    /**
     * Add token to blacklist until its expiration time
     */
    public void blacklistToken(String token) {
        String tokenId = extractTokenId(token);
        Date expiration = jwtService.extractExpiration(token);
        long ttlSeconds = (expiration.getTime() - System.currentTimeMillis()) / MILLISECONDS_IN_SECOND;
        
        if (ttlSeconds > 0) {
            String key = BLACKLIST_KEY_PREFIX + tokenId;
            redisTemplate.opsForValue().set(key, "blacklisted", Duration.ofSeconds(ttlSeconds));
            log.info("Token blacklisted successfully with TTL: {} seconds", ttlSeconds);
        }
    }
    
    /**
     * Check if token is blacklisted
     */
    public boolean isTokenBlacklisted(String token) {
        String tokenId = extractTokenId(token);
        String key = BLACKLIST_KEY_PREFIX + tokenId;
        return redisTemplate.hasKey(key);
    }
    
    /**
     * Extract a unique identifier from token for blacklisting
     * Using a combination of username and issued time as identifier
     */
    private String extractTokenId(String token) {
        String username = jwtService.extractUsername(token);
        Date issuedAt = jwtService.extractClaim(token, Claims::getIssuedAt);
        return username + ":" + issuedAt.getTime();
    }
}