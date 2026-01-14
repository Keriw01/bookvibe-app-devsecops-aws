package com.example.bookvibeapi.repositories;

import com.example.bookvibeapi.models.Book;

import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface BookRepository extends JpaRepository<Book, Long> {
    @Query("SELECT DISTINCT b FROM Book b LEFT JOIN FETCH b.collections c LEFT JOIN FETCH c.collection")
    Set<Book> findAllWithCollections();
}
