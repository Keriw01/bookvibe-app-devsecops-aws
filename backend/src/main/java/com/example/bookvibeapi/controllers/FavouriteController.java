package com.example.bookvibeapi.controllers;

import com.example.bookvibeapi.dtos.FavouriteDTO;
import com.example.bookvibeapi.services.FavouriteService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favourites")
@RequiredArgsConstructor
public class FavouriteController {

    private final FavouriteService favouriteService;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<FavouriteDTO> addToFavourites(
            @RequestParam Long bookId,
            @RequestParam Integer userId) {
        try {
            FavouriteDTO favouriteDto = favouriteService.addFavouriteAndReturnDto(bookId, userId);
            return ResponseEntity.ok(favouriteDto);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> removeFromFavourites(
            @RequestParam Long bookId,
            @RequestParam Integer userId) {
        try {
            favouriteService.removeFromFavourites(bookId, userId);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
             return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('USER', 'MODERATOR')")
    public ResponseEntity<List<FavouriteDTO>> getUserFavourites(@PathVariable Integer userId) {
        try {
            List<FavouriteDTO> favouriteDtos = favouriteService.getUserFavouritesDTO(userId);
            return ResponseEntity.ok(favouriteDtos);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }


    @GetMapping("/check")
    public ResponseEntity<Boolean> isBookInFavourites(
            @RequestParam Long bookId,
            @RequestParam Integer userId) {
        boolean isInFavourites = favouriteService.isBookInFavourites(bookId, userId);
        return ResponseEntity.ok(isInFavourites);
    }
}