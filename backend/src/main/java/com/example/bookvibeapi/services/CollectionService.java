package com.example.bookvibeapi.services;

import com.example.bookvibeapi.models.Collection;
import com.example.bookvibeapi.repositories.CollectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CollectionService {
    private final CollectionRepository collectionRepository;

    @Autowired
    public CollectionService(CollectionRepository collectionRepository) {
        this.collectionRepository = collectionRepository;
    }

    public List<Collection> getAllCollections() {
        return collectionRepository.findAll();
    }

    public Collection getCollectionById(Long id) {
        return collectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Collection not found with id: " + id));
    }

    public Collection addCollection(Collection collection) {
        return collectionRepository.save(collection);
    }

    public Collection updateCollection(Long id, Collection collectionDetails) {
        Collection collection = getCollectionById(id);
        collection.setName(collectionDetails.getName());
        return collectionRepository.save(collection);
    }

    public void deleteCollection(Long id) {
        collectionRepository.deleteById(id);
    }
}