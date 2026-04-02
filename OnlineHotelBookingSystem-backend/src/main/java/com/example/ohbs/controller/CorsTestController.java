package com.example.ohbs.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class CorsTestController {

    @GetMapping("/cors-check")
    public Map<String, String> testCors() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "CORS is working!");
        response.put("message", "If you can see this, CORS is configured correctly");
        return response;
    }
    
    @GetMapping("/headers")
    public Map<String, String> getHeaders(@RequestHeader Map<String, String> headers) {
        Map<String, String> response = new HashMap<>();
        response.put("origin", headers.getOrDefault("origin", "No origin header"));
        response.put("host", headers.getOrDefault("host", "No host header"));
        return response;
    }
}