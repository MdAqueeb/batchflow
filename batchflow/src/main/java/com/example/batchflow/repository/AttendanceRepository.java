package com.example.batchflow.repository;

import com.example.batchflow.entity.Attendance;
import com.example.batchflow.enums.AttendanceStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findBySessionId(Long sessionId);
    Optional<Attendance> findBySessionIdAndStudentId(Long sessionId, UUID studentId);
    long countBySessionBatchInstitutionId(Long institutionId);
    List<Attendance> findBySessionBatchInstitutionId(Long institutionId);
    List<Attendance> findBySessionBatchId(Long batchId);
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.session.batch.id = :batchId")
    long countByBatchId(Long batchId);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.session.batch.id = :batchId AND a.status = :status")
    long countByBatchIdAndStatus(Long batchId, AttendanceStatus status);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.session.batch.institution.id = :instId")
    long countByInstitutionId(Long instId);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.session.batch.institution.id = :instId AND a.status = :status")
    long countByInstitutionIdAndStatus(Long instId, AttendanceStatus status);
}
