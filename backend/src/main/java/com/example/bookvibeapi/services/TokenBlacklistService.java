package com.example.bookvibeapi.services;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Date;

@Service
public class TokenBlacklistService {

    private final StringRedisTemplate redisTemplate;
    private final JwtService jwtService;

    public TokenBlacklistService(StringRedisTemplate redisTemplate, JwtService jwtService) {
        this.redisTemplate = redisTemplate;
        this.jwtService = jwtService;
    }

    public void blacklistToken(String token) {
        String jti = jwtService.extractJti(token);
        Date expiration = jwtService.extractExpiration(token);

        long remainingTime = expiration.getTime() - System.currentTimeMillis();

        if (jti != null && remainingTime > 0) {
            redisTemplate.opsForValue().set("blacklist:" + jti, "true", Duration.ofMillis(remainingTime));
        }
    }

    public boolean isTokenBlacklisted(String token) {
        String jti = jwtService.extractJti(token);
        return jti != null && redisTemplate.hasKey("blacklist:" + jti);
    }
}