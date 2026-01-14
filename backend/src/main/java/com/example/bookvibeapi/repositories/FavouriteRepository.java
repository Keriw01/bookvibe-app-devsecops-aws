package com.example.bookvibeapi.repositories;

import com.example.bookvibeapi.models.Favourite;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FavouriteRepository extends JpaRepository<Favourite, Long> {
    boolean existsByBookIdAndUserId(Long bookId, Integer userId);
    void deleteByBookIdAndUserId(Long bookId, Integer userId);
    List<Favourite> findByUserId(Integer userId);
    Optional<Favourite> findByBookIdAndUserId(Long bookId, Integer userId);
}