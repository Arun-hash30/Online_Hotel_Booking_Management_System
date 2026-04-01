package com.example.ohbs.dto;

import lombok.Data;

@Data
public class CancellationRequestDTO {
    private Long bookingId;
    private String reason;
    
    public Long getBookingId() {
        return bookingId;
    }
    
    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
}