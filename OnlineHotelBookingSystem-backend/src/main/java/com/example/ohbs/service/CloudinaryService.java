package com.example.ohbs.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    @Value("${cloudinary.upload-folder}")
    private String uploadFolder;

    public String uploadImage(MultipartFile file, String folder) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), 
            ObjectUtils.asMap(
                "folder", uploadFolder + "/" + folder,
                "resource_type", "auto"
            ));
        return uploadResult.get("secure_url").toString();
    }

    public List<String> uploadMultipleImages(List<MultipartFile> files, String folder) throws IOException {
        List<String> imageUrls = new ArrayList<>();
        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                String url = uploadImage(file, folder);
                imageUrls.add(url);
            }
        }
        return imageUrls;
    }

    public void deleteImage(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }

    public String extractPublicIdFromUrl(String url) {
        // Example: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/image.jpg
        String[] parts = url.split("/upload/");
        if (parts.length > 1) {
            String[] pathParts = parts[1].split("/");
            if (pathParts.length > 1) {
                return pathParts[1].split("\\.")[0];
            }
        }
        return null;
    }
}