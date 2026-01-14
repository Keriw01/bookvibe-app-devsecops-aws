package com.example.bookvibeapi.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.sql.Date;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.hibernate.annotations.TimeZoneColumn;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Getter
@Setter
@Entity
@Table(name = "books")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;
    @Column(nullable = false)
    private String author;

    @TimeZoneColumn
    @Column(name = "release_date",
            nullable = false)
    private Date releaseDate;
    
    @Column(nullable = true)
    private String description;

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CollectionBook> collections = new HashSet<>();

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Favourite> favourites = new ArrayList<>();

    // Constructors
    public Book() {}

    public Book(String title, String author, Date releaseDate, String description) {
        this.title = title;
        this.author = author;
        this.releaseDate = releaseDate;
        this.description = description;
    }
}
