package com.example.ohbs.repository;

import com.example.ohbs.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    // Simple price filter
    List<Room> findByPricePerNightLessThanEqual(double price);

    // Find rooms by single hotel ID
    @Query("SELECT r FROM Room r WHERE r.hotelId = :hotelId")
    List<Room> findByHotelId(@Param("hotelId") Long hotelId);
    
    // ADD THIS: Find rooms by multiple hotel IDs
    @Query("SELECT r FROM Room r WHERE r.hotelId IN :hotelIds")
    List<Room> findByHotelIdIn(@Param("hotelIds") List<Long> hotelIds);
    
    // Optional: Find rooms by hotel ID with pagination
    // List<Room> findByHotelId(Long hotelId, Pageable pageable);
}