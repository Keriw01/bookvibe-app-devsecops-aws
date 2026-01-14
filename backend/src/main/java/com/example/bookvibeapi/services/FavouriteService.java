package com.example.bookvibeapi.services;

import com.example.bookvibeapi.dtos.FavouriteDTO;
import com.example.bookvibeapi.mapper.FavouriteMapper;
import com.example.bookvibeapi.models.Book;
import com.example.bookvibeapi.models.Favourite;
import com.example.bookvibeapi.models.User;
import com.example.bookvibeapi.repositories.FavouriteRepository;
import lombok.RequiredArgsConstructor;

import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavouriteService {
    private final FavouriteRepository favouriteRepository;
    private final BookService bookService;
    private final UserService userService;
    private final FavouriteMapper favouriteMapper;

    @Transactional
    public FavouriteDTO addFavouriteAndReturnDto(Long bookId, Integer userId) {
        Book book = bookService.getBookById(bookId);
        User user = userService.getUserById(userId);

        Optional<Favourite> existingFavouriteOpt = favouriteRepository.findByBookIdAndUserId(bookId, userId);

        if (existingFavouriteOpt.isPresent()) {
            return favouriteMapper.toDto(existingFavouriteOpt.get());
        } else {
            Favourite newFavourite = new Favourite();
            newFavourite.setBook(book);
            newFavourite.setUser(user);
            Favourite savedFavourite = favouriteRepository.save(newFavourite);

            return favouriteMapper.toDto(savedFavourite);
        }
    }

    @Transactional
    public void removeFromFavourites(Long bookId, Integer userId) {
        userService.getUserById(userId);
        favouriteRepository.deleteByBookIdAndUserId(bookId, userId);
    }

    public List<FavouriteDTO> getUserFavouritesDTO(Integer userId) {
        userService.getUserById(userId);
        List<Favourite> favourites = favouriteRepository.findByUserId(userId);
        return favouriteMapper.toDtoList(favourites);
    }

    public boolean isBookInFavourites(Long bookId, Integer userId) {
        return favouriteRepository.existsByBookIdAndUserId(bookId, userId);
    }
}