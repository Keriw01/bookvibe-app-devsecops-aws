package com.example.bookvibeapi.bootstrap;

import java.util.Optional;

import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.bookvibeapi.dtos.RegisterUserDto;
import com.example.bookvibeapi.models.Role;
import com.example.bookvibeapi.models.RoleEnum;
import com.example.bookvibeapi.models.User;
import com.example.bookvibeapi.repositories.RoleRepository;
import com.example.bookvibeapi.repositories.UserRepository;

/// TODO: Obecne rozwiązanie jest tylko dla celów dev, w produkcji należy użyć zmiennych środowiskowych.
/// 
/// Klasa odpowiedzialna za automatyczne tworzenie konta moderatora podczas startu aplikacji.

@Component
public class ModeratorSeeder implements ApplicationListener<ContextRefreshedEvent> {
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;
    
    public ModeratorSeeder(
        RoleRepository roleRepository,
        UserRepository  userRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void onApplicationEvent(ContextRefreshedEvent contextRefreshedEvent) {
        this.createModerator();
    }

    private void createModerator() {
        RegisterUserDto userDto = new RegisterUserDto();
        userDto.setFullName("Moderator").setEmail("moderator@o2.pl").setPassword("Test123#");

        Optional<Role> optionalRole = roleRepository.findByName(RoleEnum.MODERATOR);
        Optional<User> optionalUser = userRepository.findByEmail(userDto.getEmail());

        if (optionalRole.isEmpty() || optionalUser.isPresent()) {
            return;
        }

        var user = new User()
            .setFullName(userDto.getFullName())
            .setEmail(userDto.getEmail())
            .setPassword(passwordEncoder.encode(userDto.getPassword()))
            .setRole(optionalRole.get());

        userRepository.save(user);
    }
}
