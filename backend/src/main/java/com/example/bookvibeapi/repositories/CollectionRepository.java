package com.example.bookvibeapi.repositories;

import com.example.bookvibeapi.models.Collection;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CollectionRepository extends JpaRepository<Collection, Long> {
}
