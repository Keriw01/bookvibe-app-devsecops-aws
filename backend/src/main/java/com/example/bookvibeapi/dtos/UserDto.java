package com.example.bookvibeapi.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserDto(
    @NotNull Integer id,
    @NotBlank String fullName,
    @Email String email
) {}