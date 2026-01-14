package com.example.bookvibeapi.mapper;

import com.example.bookvibeapi.dtos.UserDto;
import com.example.bookvibeapi.models.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public UserDto toDto(User user) {
        if (user == null) {
            return null;
        }
        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail()
        );
    }
}