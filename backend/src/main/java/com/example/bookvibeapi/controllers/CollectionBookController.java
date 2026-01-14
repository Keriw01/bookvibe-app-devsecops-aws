package com.example.bookvibeapi.controllers;

import com.example.bookvibeapi.dtos.CollectionDTO;
import com.example.bookvibeapi.mapper.BookMapper;
import com.example.bookvibeapi.models.CollectionBook;
import com.example.bookvibeapi.services.CollectionBookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/collection-books")
public class CollectionBookController {
    private final CollectionBookService collectionBookService;
    private final BookMapper bookMapper;

    @Autowired
    public CollectionBookController(CollectionBookService collectionBookService, BookMapper bookMapper) {
        this.collectionBookService = collectionBookService;
        this.bookMapper = bookMapper;
    }

    @PostMapping
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<CollectionDTO> addBookToCollection(
            @RequestParam Long bookId,
            @RequestParam Long collectionId) {
        CollectionBook relation = collectionBookService.addBookToCollection(bookId, collectionId);
        return ResponseEntity.ok(bookMapper.toCollectionDTO(relation.getCollection()));
    }

    @DeleteMapping
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<Void> removeBookFromCollection(
            @RequestParam Long bookId,
            @RequestParam Long collectionId) {
        collectionBookService.removeBookFromCollection(bookId, collectionId);
        return ResponseEntity.noContent().build();
    }
}