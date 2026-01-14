package com.example.bookvibeapi.controllers;

import com.example.bookvibeapi.models.User;
import com.example.bookvibeapi.dtos.LoginUserDto;
import com.example.bookvibeapi.dtos.RegisterUserDto;
import com.example.bookvibeapi.responses.LoginResponse;
import com.example.bookvibeapi.services.AuthenticationService;
import com.example.bookvibeapi.services.JwtService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import java.util.Map;
import jakarta.servlet.http.Cookie;
import java.util.Arrays;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/auth")
@RestController
@Validated
public class AuthenticationController {
    private final JwtService jwtService;
    private final AuthenticationService authenticationService;

    public AuthenticationController(JwtService jwtService, AuthenticationService authenticationService) {
        this.jwtService = jwtService;
        this.authenticationService = authenticationService;
    }

    @GetMapping("/csrf-token")
    public ResponseEntity<Map<String, String>> getCsrfToken(HttpServletRequest request) {
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (csrfToken == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        return ResponseEntity.ok(Map.of(
                "csrfToken", csrfToken.getToken(),
                "headerName", csrfToken.getHeaderName()));
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(
            @Valid @RequestBody RegisterUserDto registerUserDto,
            HttpServletResponse response) {

        User registeredUser = authenticationService.signup(registerUserDto);
        User authenticatedUser = authenticationService.authenticate(
                new LoginUserDto()
                        .setEmail(registerUserDto.getEmail())
                        .setPassword(registerUserDto.getPassword()));

        String jwtToken = jwtService.generateToken(authenticatedUser);
        response.addHeader(HttpHeaders.SET_COOKIE, createHttpOnlyCookie("JWT", jwtToken).toString());

        return ResponseEntity.ok(new LoginResponse()
                .setExpiresIn(jwtService.getExpirationTime())
                .setUser(authenticatedUser)
                .setRefreshToken(authenticatedUser.getRefreshToken()));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticate(
            @Valid @RequestBody LoginUserDto loginUserDto,
            HttpServletResponse response) {
        User authenticatedUser = authenticationService.authenticate(loginUserDto);
        String jwtToken = jwtService.generateToken(authenticatedUser);

        response.addHeader(HttpHeaders.SET_COOKIE, createHttpOnlyCookie("JWT", jwtToken).toString());

         return ResponseEntity.ok(new LoginResponse()
                .setExpiresIn(jwtService.getExpirationTime())
                .setUser(authenticatedUser)
                .setRefreshToken(authenticatedUser.getRefreshToken()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refreshToken(@RequestBody Map<String, String> request, HttpServletResponse response) {
        String refreshToken = request.get("refreshToken");
        if (refreshToken == null || refreshToken.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        LoginResponse loginResponse = authenticationService.refreshToken(refreshToken);

        String newAccessToken = jwtService.generateToken(loginResponse.getUser());
        response.addHeader(HttpHeaders.SET_COOKIE, createHttpOnlyCookie("JWT", newAccessToken).toString());

        return ResponseEntity.ok(loginResponse);
    }

    private ResponseCookie createHttpOnlyCookie(String name, String value) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(false) // TODO: do zmienienia na true jeżeli połączenie przez HTTPS
                .path("/")
                .maxAge(jwtService.getExpirationTime() / 1000)
                .sameSite("Strict")
                .build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String accessToken = null;
        if (request.getCookies() != null) {
            accessToken = Arrays.stream(request.getCookies())
                                .filter(cookie -> "JWT".equals(cookie.getName()))
                                .map(Cookie::getValue)
                                .findFirst()
                                .orElse(null);
        }

        if (authentication != null && authentication.getPrincipal() instanceof User && accessToken != null) {
            User currentUser = (User) authentication.getPrincipal();
            authenticationService.logout(currentUser, accessToken);
        }
        
        ResponseCookie jwtCookie = ResponseCookie.from("JWT", "")
                .maxAge(0)
                .path("/")
                .httpOnly(true)
                .secure(false)
                .sameSite("Strict")
                .build();

        ResponseCookie xsrfCookie = ResponseCookie.from("XSRF-TOKEN", "")
                .maxAge(0)
                .path("/")
                .httpOnly(true)
                .secure(false)
                .sameSite("Strict")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, jwtCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, xsrfCookie.toString());
        return ResponseEntity.ok().build();
    }
}