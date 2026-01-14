package com.example.bookvibeapi.mapper;


import org.springframework.stereotype.Component;

import com.example.bookvibeapi.dtos.BookDTO;
import com.example.bookvibeapi.dtos.CollectionDTO;
import com.example.bookvibeapi.models.Book;
import com.example.bookvibeapi.models.Collection;

import java.util.Set;
import java.util.stream.Collectors;

@Component
public class BookMapper {

    public BookDTO toBookDTO(Book book) {
        Set<Long> collIds = book.getCollections().stream() 
        .map(collectionBook -> collectionBook.getCollection().getId())
        .collect(Collectors.toSet()); 

        return BookDTO.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .releaseDate(book.getReleaseDate() != null ? book.getReleaseDate().toString() : null)
                .description(book.getDescription())
                .collectionIds(collIds)
                .build();
    }

    public CollectionDTO toCollectionDTO(Collection collection) {
        CollectionDTO dto = new CollectionDTO();
        dto.setId(collection.getId());
        dto.setName(collection.getName());

        return dto;
    }
}