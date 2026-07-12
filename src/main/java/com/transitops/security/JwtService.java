package com.transitops.security;

import com.transitops.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class JwtService {

    private static final String SECRET =
            "TransitOpsSecretKeyForHackathonProject2026TransitOps";

    private final Key key = Keys.hmacShaKeyFor(SECRET.getBytes());

    public String generateToken(User user) {
        List<String> permissions = new ArrayList<>();
        if (user.getRole().getPermissions() != null) {
            user.getRole().getPermissions().forEach(perm -> {
                permissions.add("PERM_" + perm.getModule() + "_" + perm.getAction());
            });
        }

        return Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getId())
                .claim("employeeId", user.getEmployeeId())
                .claim("role", user.getRole().getName())
                .claim("permissions", permissions)
                .claim("forcePasswordChange", user.getForcePasswordChange())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractEmail(String token) {
        Claims claims = Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    public boolean isTokenValid(String token, String email) {
        try {
            final String extractedEmail = extractEmail(token);
            return extractedEmail.equals(email) && !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith((javax.crypto.SecretKey) key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return true;
        }
    }
}