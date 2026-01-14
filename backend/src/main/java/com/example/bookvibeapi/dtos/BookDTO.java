package com.example.bookvibeapi.dtos;

import java.util.Set;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Builder
public class BookDTO {
    private Long id;
    private String title;
    private String author;
    private String releaseDate;
    private String description;
    private Set<Long> collectionIds;
}
