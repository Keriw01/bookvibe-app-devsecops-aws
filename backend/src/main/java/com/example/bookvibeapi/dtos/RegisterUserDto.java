package com.example.bookvibeapi.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RegisterUserDto {
    @NotBlank(message = "Email jest wymagany")
    @Email(message = "Proszę podać prawidłowy adres email")
    private String email;

    @NotBlank(message = "Hasło jest wymagane")
    @Size(min = 8, message = "Hasło musi mieć co najmniej 8 znaków")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$", 
             message = "Hasło musi zawierać co najmniej jedną cyfrę, jedną małą literę i jedną wielką literę")
    private String password;

    @NotBlank(message = "Imię i nazwisko jest wymagane")
    @Size(min = 3, max = 100, message = "Imię i nazwisko musi mieć od 3 do 100 znaków")
    @Pattern(regexp = "^[\\p{L} .'-]+$", message = "Imię i nazwisko może zawierać tylko litery, spacje oraz znaki .'-")
    private String fullName;

    public String getEmail() {
        return email;
    }

    public RegisterUserDto setEmail(String email) {
        this.email = email;
        return this;
    }

    public String getPassword() {
        return password;
    }

    public RegisterUserDto setPassword(String password) {
        this.password = password;
        return this;
    }

    public String getFullName() {
        return fullName;
    }

    public RegisterUserDto setFullName(String fullName) {
        this.fullName = fullName;
        return this;
    }

    @Override
    public String toString() {
        return "RegisterUserDto{" +
                "email='" + email + '\'' +
                ", password='" + password + '\'' +
                ", fullName='" + fullName + '\'' +
                '}';
    }
}