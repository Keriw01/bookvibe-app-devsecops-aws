package com.example.bookvibeapi.services;

import com.example.bookvibeapi.dtos.LoginUserDto;
import com.example.bookvibeapi.dtos.RegisterUserDto;
import com.example.bookvibeapi.models.Role;
import com.example.bookvibeapi.models.RoleEnum;
import com.example.bookvibeapi.models.User;
import com.example.bookvibeapi.repositories.RoleRepository;
import com.example.bookvibeapi.repositories.UserRepository;
import com.example.bookvibeapi.responses.LoginResponse;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AuthenticationService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final TokenBlacklistService tokenBlacklistService;

    public AuthenticationService(
        UserRepository userRepository,
        RoleRepository roleRepository,
        AuthenticationManager authenticationManager,
        PasswordEncoder passwordEncoder,
        JwtService jwtService,
        TokenBlacklistService tokenBlacklistService
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    public User signup(RegisterUserDto input) {
        Optional<Role> optionalRole = roleRepository.findByName(RoleEnum.USER);

        if (optionalRole.isEmpty()) {
            return null;
        }

        var user = new User()
            .setFullName(input.getFullName())
            .setEmail(input.getEmail())
            .setPassword(passwordEncoder.encode(input.getPassword()))
            .setRole(optionalRole.get());

        return userRepository.save(user);
    }

    public User authenticate(LoginUserDto input) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                input.getEmail(),
                input.getPassword()
            )
        );

        User user = userRepository.findByEmail(input.getEmail()).orElseThrow();

        String refreshToken = jwtService.generateRefreshToken(user);
        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        return user;
    }

    public LoginResponse refreshToken(String refreshToken) {
        User user = userRepository.findByRefreshToken(refreshToken)
            .orElseThrow(() -> new EntityNotFoundException("Refresh token not found or invalid"));

        if (jwtService.isTokenValid(refreshToken, user)) {
            String newAccessToken = jwtService.generateToken(user);

            return new LoginResponse()
                .setExpiresIn(jwtService.getExpirationTime())
                .setUser(user)
                .setRefreshToken(refreshToken);
        } else {
            throw new IllegalStateException("Refresh token has expired or is invalid");
        }
    }

    public void logout(User user, String accessToken) {
        user.setRefreshToken(null);
        userRepository.save(user);

        tokenBlacklistService.blacklistToken(accessToken);
    }

    public List<User> allUsers() {
        List<User> users = new ArrayList<>();

        userRepository.findAll().forEach(users::add);

        return users;
    }
}