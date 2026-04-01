package com.example.ohbs.controller;

import com.example.ohbs.service.EmailServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/test")
@CrossOrigin(origins = "http://localhost:5173")
public class TestEmailController {
    
    @Autowired
    private EmailServices emailService;
    
    @GetMapping("/email")
    public String testEmail(@RequestParam String to) {
        try {
            emailService.sendEmail(to, "Test Email from OHBS", 
                "This is a test email to verify email configuration.\n\n" +
                "If you receive this, your email is working correctly!");
            return "Email sent successfully to " + to;
        } catch (Exception e) {
            return "Failed to send email: " + e.getMessage();
        }
    }
}