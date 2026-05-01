package com.example.batchflow.repository;

import com.example.batchflow.entity.User;
import com.example.batchflow.enums.Role;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    List<User> findByInstitution_IdAndRole(Long institutionId, Role role);

    @Query("SELECT COUNT(u) FROM User u WHERE u.institution.id = :instId AND u.role = :role")
    long countByInstitutionIdAndRole(Long instId, Role role);

    @Query("SELECT COUNT(u) FROM User u WHERE u.institution.id = :instId")
    long countByInstitutionId(Long instId);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.institution WHERE u.id = :id")
    Optional<User> findByIdWithInstitution(UUID id);    
}
