package com.example.ohbs.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "check_in_date")
    private LocalDate checkInDate;

    @Column(name = "check_out_date")
    private LocalDate checkOutDate;

    @Column(name = "status", nullable = false)
    private String status = "CONFIRMED";

    @Column(name = "total_price")
    private Double totalPrice;

    @Column(name = "cancellation_requested")
    private Boolean cancellationRequested = false;

    @Column(name = "cancellation_request_date")
    private LocalDateTime cancellationRequestDate;

    @Column(name = "cancellation_reason")
    private String cancellationReason;

    public Booking() {
        this.status = "CONFIRMED";
        this.cancellationRequested = false;
    }

    public Booking(User user, Room room, LocalDate checkInDate, LocalDate checkOutDate) {
        this.user = user;
        this.room = room;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.status = "CONFIRMED";
        this.cancellationRequested = false;
        this.calculateTotalPrice();
    }

    public void calculateTotalPrice() {
        if (this.room != null && this.room.getPricePerNight() != null &&
                this.checkInDate != null && this.checkOutDate != null) {
            long nights = java.time.temporal.ChronoUnit.DAYS.between(checkInDate, checkOutDate);
            this.totalPrice = this.room.getPricePerNight() * nights;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) {
        this.user = user;
        if (this.room != null && this.checkInDate != null && this.checkOutDate != null) calculateTotalPrice();
    }

    public Room getRoom() { return room; }
    public void setRoom(Room room) {
        this.room = room;
        if (this.user != null && this.checkInDate != null && this.checkOutDate != null) calculateTotalPrice();
    }

    public LocalDate getCheckInDate() { return checkInDate; }
    public void setCheckInDate(LocalDate checkInDate) {
        this.checkInDate = checkInDate;
        if (this.user != null && this.room != null && this.checkOutDate != null) calculateTotalPrice();
    }

    public LocalDate getCheckOutDate() { return checkOutDate; }
    public void setCheckOutDate(LocalDate checkOutDate) {
        this.checkOutDate = checkOutDate;
        if (this.user != null && this.room != null && this.checkInDate != null) calculateTotalPrice();
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }

    public Boolean getCancellationRequested() { return cancellationRequested; }
    public void setCancellationRequested(Boolean cancellationRequested) { this.cancellationRequested = cancellationRequested; }

    public LocalDateTime getCancellationRequestDate() { return cancellationRequestDate; }
    public void setCancellationRequestDate(LocalDateTime cancellationRequestDate) { this.cancellationRequestDate = cancellationRequestDate; }

    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }
}