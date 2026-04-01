package com.example.ohbs.repository;

import com.example.ohbs.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    // FIX: Removed "JOIN FETCH r.hotel" — Room no longer has a 'hotel' relationship,
    // it only has 'hotelId' (Long). Hotel name is looked up separately in BookingService.

    @Query("SELECT b FROM Booking b JOIN FETCH b.user JOIN FETCH b.room")
    List<Booking> findAllWithDetails();

    @Query("SELECT b FROM Booking b JOIN FETCH b.user JOIN FETCH b.room WHERE b.id = :id")
    Optional<Booking> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT b FROM Booking b JOIN FETCH b.user JOIN FETCH b.room WHERE b.user.id = :userId")
    List<Booking> findByUserIdWithDetails(@Param("userId") Long userId);

    @Query("SELECT b FROM Booking b JOIN FETCH b.user JOIN FETCH b.room WHERE b.cancellationRequested = true")
    List<Booking> findPendingCancellationsWithDetails();

    // Kept for internal use (availability checks — no associations needed)
    List<Booking> findByUserId(Long userId);
    List<Booking> findByCancellationRequestedTrue();

    @Query("SELECT b FROM Booking b WHERE b.room.id = :roomId " +
           "AND b.checkInDate < :checkOutDate AND b.checkOutDate > :checkInDate")
    List<Booking> findOverlappingBookings(@Param("roomId") Long roomId,
                                          @Param("checkInDate") LocalDate checkInDate,
                                          @Param("checkOutDate") LocalDate checkOutDate);

    @Query("SELECT b FROM Booking b WHERE b.room.id = :roomId " +
           "AND b.checkInDate < :checkOutDate AND b.checkOutDate > :checkInDate")
    List<Booking> findConflictingBookings(@Param("roomId") Long roomId,
                                          @Param("checkInDate") LocalDate checkInDate,
                                          @Param("checkOutDate") LocalDate checkOutDate);
}