package com.example.ohbs.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class HotelImageDTO {
    private Long hotelId;
    private List<MultipartFile> images;
}