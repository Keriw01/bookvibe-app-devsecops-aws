package com.example.bookvibeapi.dtos;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor; 

@Setter
@Getter
@Builder
@NoArgsConstructor 
@AllArgsConstructor 
public class FavouriteDTO {
    private Long id;
    private BookDTO book;
    private UserDto user;
}