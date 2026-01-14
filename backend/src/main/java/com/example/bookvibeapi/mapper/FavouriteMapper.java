package com.example.bookvibeapi.mapper;

import com.example.bookvibeapi.dtos.FavouriteDTO;
import com.example.bookvibeapi.models.Favourite;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class FavouriteMapper {

    private final BookMapper bookMapper;
    private final UserMapper userMapper;

    public FavouriteDTO toDto(Favourite favourite) {
        if (favourite == null) {
            return null;
        }

        return FavouriteDTO.builder()
                .id(favourite.getId())
                .book(bookMapper.toBookDTO(favourite.getBook()))
                .user(userMapper.toDto(favourite.getUser()))
                .build();
    }

    public List<FavouriteDTO> toDtoList(List<Favourite> favourites) {
        if (favourites == null || favourites.isEmpty()) {
            return Collections.emptyList();
        }
        return favourites.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}