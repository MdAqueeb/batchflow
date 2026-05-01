package com.example.batchflow.repository;

import com.example.batchflow.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long> {
    List<Batch> findByInstitutionId(Long institutionId);

    long countByInstitutionId(Long institutionId);

    @Query("SELECT COUNT(s) FROM Session s WHERE s.batch.id = :batchId")
    long countSessionsByBatchId(Long batchId);

    @Query("SELECT COUNT(s) FROM Session s WHERE s.batch.institution.id = :instId")
    long countSessionsByInstitutionId(Long instId);

    @Query("SELECT COUNT(bs) FROM Batch b JOIN b.students bs WHERE b.id = :batchId")
    long countStudentsByBatchId(Long batchId);

    @Query("SELECT COUNT(bt) FROM Batch b JOIN b.trainers bt WHERE b.id = :batchId")
    long countTrainersByBatchId(Long batchId);

    @Query("SELECT COUNT(bt) > 0 FROM Batch b JOIN b.trainers bt WHERE b.id = :batchId AND bt.id = :trainerId")
    boolean existsTrainerInBatch(Long batchId, UUID trainerId);
}
