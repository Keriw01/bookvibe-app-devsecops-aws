package com.example.bookvibeapi.controllers;

import com.example.bookvibeapi.models.Collection;
import com.example.bookvibeapi.dtos.BookDTO;
import com.example.bookvibeapi.dtos.CollectionDTO;
import com.example.bookvibeapi.mapper.BookMapper;
import com.example.bookvibeapi.services.CollectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/collections")
public class CollectionController {
    private final CollectionService collectionService;
    private final BookMapper bookMapper;

    @Autowired
    public CollectionController(CollectionService collectionService, BookMapper bookMapper) {
        this.collectionService = collectionService;
        this.bookMapper = bookMapper;
    }

    @GetMapping
    public List<CollectionDTO> getAllCollections() {
        return collectionService.getAllCollections().stream()
                .map(bookMapper::toCollectionDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}/books")
    public ResponseEntity<List<BookDTO>> getBooksInCollection(@PathVariable Long id) {
        Collection collection = collectionService.getCollectionById(id);

        List<BookDTO> bookDtos = collection.getBooks().stream()

                .map(collectionBook -> collectionBook.getBook())

                .map(bookMapper::toBookDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(bookDtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CollectionDTO> getCollectionById(@PathVariable Long id) {
        Collection collection = collectionService.getCollectionById(id);
        return ResponseEntity.ok(bookMapper.toCollectionDTO(collection));
    }

    @PostMapping
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<CollectionDTO> addCollection(@RequestBody Collection collection) {
        Collection savedCollection = collectionService.addCollection(collection);
        return ResponseEntity.ok(bookMapper.toCollectionDTO(savedCollection));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<CollectionDTO> updateCollection(@PathVariable Long id,
            @RequestBody Collection collectionDetails) {
        Collection updatedCollection = collectionService.updateCollection(id, collectionDetails);
        return ResponseEntity.ok(bookMapper.toCollectionDTO(updatedCollection));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<Void> deleteCollection(@PathVariable Long id) {
        collectionService.deleteCollection(id);
        return ResponseEntity.noContent().build();
    }
}