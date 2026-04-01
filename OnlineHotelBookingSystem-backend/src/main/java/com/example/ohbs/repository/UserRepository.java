package com.example.ohbs.repository;

import com.example.ohbs.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByEmailAndRole(String email, String role);
    
    List<User> findByRole(String role);
    
    boolean existsByEmail(String email);
}