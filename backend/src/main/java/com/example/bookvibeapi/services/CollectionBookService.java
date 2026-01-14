package com.example.bookvibeapi.services;

import com.example.bookvibeapi.models.CollectionBook;
import com.example.bookvibeapi.repositories.CollectionBookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
public class CollectionBookService {
    private final CollectionBookRepository collectionBookRepository;
    private final BookService bookService;
    private final CollectionService collectionService;

    @Autowired
    public CollectionBookService(CollectionBookRepository collectionBookRepository,
                                 BookService bookService,
                                 CollectionService collectionService) {
        this.collectionBookRepository = collectionBookRepository;
        this.bookService = bookService;
        this.collectionService = collectionService;
    }

    @Transactional
    public CollectionBook addBookToCollection(Long bookId, Long collectionId) {
        CollectionBook relation = new CollectionBook();
        relation.setBook(bookService.getBookById(bookId));
        relation.setCollection(collectionService.getCollectionById(collectionId));
        return collectionBookRepository.save(relation);
    }

    @Transactional
    public void removeBookFromCollection(Long bookId, Long collectionId) {
        collectionBookRepository.deleteByBookIdAndCollectionId(bookId, collectionId);
    }
}
