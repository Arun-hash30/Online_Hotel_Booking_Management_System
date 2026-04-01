package com.example.ohbs.service;

import com.example.ohbs.dto.RoomDTO;
import com.example.ohbs.model.Hotel;
import com.example.ohbs.model.Room;
import com.example.ohbs.repository.HotelRepository;
import com.example.ohbs.repository.RoomRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private HotelRepository hotelRepository; // Add this

    @Autowired
    private ModelMapper modelMapper;
    
    @Autowired
    private CloudinaryService cloudinaryService;

    public RoomDTO createRoom(RoomDTO roomDTO) {
        Room room = modelMapper.map(roomDTO, Room.class);
        Room savedRoom = roomRepository.save(room);
        return modelMapper.map(savedRoom, RoomDTO.class);
    }

    public RoomDTO createRoomWithImages(RoomDTO roomDTO, List<MultipartFile> images) throws IOException {
        Room room = modelMapper.map(roomDTO, Room.class);
        
        if (images != null && !images.isEmpty()) {
            List<String> imageUrls = cloudinaryService.uploadMultipleImages(images, "rooms");
            room.setImages(imageUrls);
        }
        
        Room savedRoom = roomRepository.save(room);
        return modelMapper.map(savedRoom, RoomDTO.class);
    }

    public RoomDTO uploadRoomImages(Long roomId, List<MultipartFile> images) throws IOException {
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new RuntimeException("Room not found with id: " + roomId));
        
        List<String> newImageUrls = cloudinaryService.uploadMultipleImages(images, "rooms");
        
        List<String> existingImages = room.getImages();
        if (existingImages != null) {
            existingImages.addAll(newImageUrls);
            room.setImages(existingImages);
        } else {
            room.setImages(newImageUrls);
        }
        
        Room updatedRoom = roomRepository.save(room);
        return modelMapper.map(updatedRoom, RoomDTO.class);
    }

    public Optional<RoomDTO> getRoomById(Long id) {
        return roomRepository.findById(id).map(room -> modelMapper.map(room, RoomDTO.class));
    }

    public List<RoomDTO> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(room -> modelMapper.map(room, RoomDTO.class))
                .collect(Collectors.toList());
    }

    public RoomDTO updateRoom(Long id, RoomDTO roomDTO) {
        Room roomToUpdate = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        modelMapper.map(roomDTO, roomToUpdate);
        Room updatedRoom = roomRepository.save(roomToUpdate);
        return modelMapper.map(updatedRoom, RoomDTO.class);
    }

    public void deleteRoom(Long id) {
        Room room = roomRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Room not found with id: " + id));
        
        if (room.getImages() != null) {
            for (String imageUrl : room.getImages()) {
                try {
                    String publicId = cloudinaryService.extractPublicIdFromUrl(imageUrl);
                    if (publicId != null) {
                        cloudinaryService.deleteImage(publicId);
                    }
                } catch (IOException e) {
                    System.err.println("Failed to delete image: " + imageUrl);
                }
            }
        }
        
        roomRepository.deleteById(id);
    }
    
    public List<RoomDTO> findRoomsByPrice(double price) {
        List<Room> rooms = roomRepository.findByPricePerNightLessThanEqual(price);
        return rooms.stream()
                .map(room -> modelMapper.map(room, RoomDTO.class))
                .collect(Collectors.toList());
    }
    
    // FIXED: Method to find rooms by hotel star rating
    public List<RoomDTO> findRoomsByHotelStarRating(int starRating) {
        // First, find all hotels with the given star rating
        List<Hotel> hotels = hotelRepository.findByStarRating(starRating);
        
        // Then, collect all room IDs from these hotels
        List<Long> hotelIds = hotels.stream()
                .map(Hotel::getId)
                .collect(Collectors.toList());
        
        // Finally, find all rooms belonging to these hotels
        List<Room> rooms = roomRepository.findByHotelIdIn(hotelIds);
        
        return rooms.stream()
                .map(room -> modelMapper.map(room, RoomDTO.class))
                .collect(Collectors.toList());
    }

    // FIXED: Method to find rooms by hotel address
    public List<RoomDTO> findRoomsByHotelAddress(String letters) {
        // First, find all hotels with address containing the letters
        List<Hotel> hotels = hotelRepository.findByAddressContainingIgnoreCase(letters);
        
        // Then, collect all room IDs from these hotels
        List<Long> hotelIds = hotels.stream()
                .map(Hotel::getId)
                .collect(Collectors.toList());
        
        // Finally, find all rooms belonging to these hotels
        List<Room> rooms = roomRepository.findByHotelIdIn(hotelIds);
        
        return rooms.stream()
                .map(room -> modelMapper.map(room, RoomDTO.class))
                .collect(Collectors.toList());
    }
}