package com.example.ohbs.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class RoomImageDTO {
    private Long roomId;
    private List<MultipartFile> images;
}