package com.example.ohbs.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "room")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "type", nullable = false)
    private String type;

    // FIX: Double (wrapper class) instead of double (primitive)
    // primitive 'double' can never be null — causes "bad operand types for !=" in Booking.java
    @Column(name = "price_per_night", nullable = false)
    private Double pricePerNight;

    @Column(name = "number_available", nullable = false)
    private int numberAvailable;

    @Column(name = "hotel_id", nullable = false)
    private Long hotelId;

    @ElementCollection
    @CollectionTable(
        name = "room_images",
        joinColumns = @JoinColumn(name = "room_id")
    )
    @Column(name = "images")
    private List<String> images;

    // ── Constructors ──────────────────────────────────────────
    public Room() {}

    public Room(String type, Double pricePerNight, int numberAvailable, Long hotelId) {
        this.type = type;
        this.pricePerNight = pricePerNight;
        this.numberAvailable = numberAvailable;
        this.hotelId = hotelId;
    }

    // ── Getters & Setters ─────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Double getPricePerNight() { return pricePerNight; }
    public void setPricePerNight(Double pricePerNight) { this.pricePerNight = pricePerNight; }

    public int getNumberAvailable() { return numberAvailable; }
    public void setNumberAvailable(int numberAvailable) { this.numberAvailable = numberAvailable; }

    public Long getHotelId() { return hotelId; }
    public void setHotelId(Long hotelId) { this.hotelId = hotelId; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }
}