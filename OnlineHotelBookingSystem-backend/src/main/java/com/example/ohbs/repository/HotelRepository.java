package com.example.ohbs.repository;

import com.example.ohbs.model.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {
    
    // Find hotels by star rating
    List<Hotel> findByStarRating(int starRating);
    
    // Find hotels by address containing letters (case insensitive)
    List<Hotel> findByAddressContainingIgnoreCase(String address);
    
    // Optional: Search hotels by name
    List<Hotel> findByNameContainingIgnoreCase(String name);
    
    // Optional: Search hotels by city/area in address
    @Query("SELECT h FROM Hotel h WHERE LOWER(h.address) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Hotel> searchByAddressKeyword(@Param("keyword") String keyword);
}