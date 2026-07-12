package com.transitops.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/vehicles/**").hasAnyRole("ADMIN", "FLEET_MANAGER", "SAFETY_OFFICER")
                        .requestMatchers("/api/vehicles/**").hasAnyRole("ADMIN", "FLEET_MANAGER")
                        .requestMatchers("/api/drivers/**").hasAnyRole("ADMIN", "FLEET_MANAGER", "SAFETY_OFFICER")
                        .requestMatchers("/api/trips/**").hasAnyRole("ADMIN", "FLEET_MANAGER", "DRIVER", "SAFETY_OFFICER", "DISPATCHER")
                        .requestMatchers("/api/maintenance/**").hasAnyRole("ADMIN", "FLEET_MANAGER")
                        .requestMatchers("/api/fuel/**").hasAnyRole("ADMIN", "FLEET_MANAGER", "DRIVER", "FINANCIAL_ANALYST")
                        .requestMatchers("/api/expenses/**").hasAnyRole("ADMIN", "FLEET_MANAGER", "FINANCIAL_ANALYST")
                        .requestMatchers("/api/reports/**").hasAnyRole("ADMIN", "FLEET_MANAGER", "FINANCIAL_ANALYST")
                        .requestMatchers("/api/dashboard").authenticated()
                        .requestMatchers("/api/profile/**").authenticated()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}