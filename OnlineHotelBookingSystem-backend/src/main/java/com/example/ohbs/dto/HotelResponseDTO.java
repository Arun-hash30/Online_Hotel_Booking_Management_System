package com.example.ohbs.dto;

import lombok.Data;
import java.util.List;

@Data
public class HotelResponseDTO {
    private Long id;
    private String name;
    private String address;
    private Long contact;
    private String description;
    private String amenities;
    private int starRating;
    private List<String> images;
    
    // Constructors
    public HotelResponseDTO() {}
    
    public HotelResponseDTO(Long id, String name, String address, Long contact, 
                           String description, String amenities, int starRating, 
                           List<String> images) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.contact = contact;
        this.description = description;
        this.amenities = amenities;
        this.starRating = starRating;
        this.images = images;
    }
}