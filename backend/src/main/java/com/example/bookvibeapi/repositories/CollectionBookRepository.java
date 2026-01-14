package com.example.bookvibeapi.repositories;

import com.example.bookvibeapi.models.CollectionBook;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;


public interface CollectionBookRepository extends JpaRepository<CollectionBook, Long> {
    @Transactional
    @Modifying
    void deleteByBookIdAndCollectionId(Long bookId, Long collectionId);

    boolean existsByBookIdAndCollectionId(Long bookId, Long collectionId);
}