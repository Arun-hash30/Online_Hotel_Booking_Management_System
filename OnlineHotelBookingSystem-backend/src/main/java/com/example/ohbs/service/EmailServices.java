package com.example.ohbs.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailServices {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    private static final Logger logger = LoggerFactory.getLogger(EmailServices.class);

    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        if (mailSender == null) {
            logger.warn("Mail sender not configured. Email not sent to: {}", to);
            return;
        }
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true indicates HTML content
            helper.setFrom("arunravikanth20@gmail.com");

            mailSender.send(message);
            logger.info("HTML Email sent successfully to {}", to);
            System.out.println("✅ HTML Email sent successfully to: " + to);
            
        } catch (Exception e) {
            logger.error("Failed to send HTML email to {}: {}", to, e.getMessage());
            System.err.println("❌ Failed to send HTML email to: " + to);
            e.printStackTrace();
        }
    }
    
    // Keep the original method for backward compatibility
    public void sendEmail(String to, String subject, String body) {
        sendHtmlEmail(to, subject, body);
    }
}