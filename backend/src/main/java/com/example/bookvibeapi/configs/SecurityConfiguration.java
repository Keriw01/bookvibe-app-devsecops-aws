package com.example.bookvibeapi.configs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfiguration {
    private final AuthenticationProvider authenticationProvider;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfiguration(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            AuthenticationProvider authenticationProvider) {
        this.authenticationProvider = authenticationProvider;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
        requestHandler.setCsrfRequestAttributeName(null);

        CookieCsrfTokenRepository csrfTokenRepository = new CookieCsrfTokenRepository();

        csrfTokenRepository.setCookieName("XSRF-TOKEN");
        csrfTokenRepository.setCookieCustomizer(cookieBuilder -> {
                cookieBuilder   
                    .maxAge(3600)               
                    .secure(false) // TODO: PRODUCTION - do zmienienia na true jeżeli połączenie przez HTTPS             
                    .sameSite("Strict")        
                    .httpOnly(false);            
            });

            // TODO: PRODUCTION - dokonać przeglądu i tej polityki.
            String cspDirectives = "default-src 'self';" +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval';" + // 'unsafe-eval' often needed for dev hot-reloading
            "style-src 'self' 'unsafe-inline';" + // 'unsafe-inline' often needed for UI libraries
            "img-src 'self' data: https://placehold.co;" + // Allow images from self, data URIs, and placeholder service
            "connect-src 'self' http://localhost:8080;" + // Allow connections to self (frontend origin) and backend API
            "font-src 'self';" + // Allow fonts from self (adjust if using external fonts/CDNs)
            "object-src 'none';" + // Disallow <object>, <embed>
            "frame-ancestors 'none';" + // Disallow embedding in iframes (clickjacking protection)
            "form-action 'self';" + // Allow form submissions only to self
            "base-uri 'self';"; // "upgrade-insecure-requests;"; // Add this if deploying to HTTPS


        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf
                        .csrfTokenRepository(csrfTokenRepository)
                        .ignoringRequestMatchers("/auth/refresh")
                        .csrfTokenRequestHandler(requestHandler)
                ) .headers(headers -> headers
                        // Add X-Content-Type-Options: nosniff
                        .contentTypeOptions(Customizer.withDefaults())
                        // Add Content-Security-Policy
                        .contentSecurityPolicy(csp -> csp.policyDirectives(cspDirectives))
                        .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin)
                        .permissionsPolicyHeader(permissions  -> permissions .policy("geolocation=(), microphone=(), camera=()"))
                )
                .authorizeHttpRequests(requests -> requests
                        .requestMatchers("/auth/**", "/error").permitAll()
                        .anyRequest().authenticated()
                )
                .sessionManagement(management -> management
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowCredentials(true);
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-XSRF-TOKEN")); 

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}