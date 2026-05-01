package com.example.batchflow.service;

import com.example.batchflow.dto.BatchSummaryResponse;
import com.example.batchflow.dto.InstitutionSummaryResponse;
import com.example.batchflow.dto.ProgrammeSummaryResponse;
import com.example.batchflow.entity.Attendance;
import com.example.batchflow.entity.Batch;
import com.example.batchflow.entity.Institution;
import com.example.batchflow.entity.User;
import com.example.batchflow.enums.AttendanceStatus;
import com.example.batchflow.enums.Role;
import com.example.batchflow.exception.ForbiddenException;
import com.example.batchflow.exception.ResourceNotFoundException;
import com.example.batchflow.repository.AttendanceRepository;
import com.example.batchflow.repository.BatchRepository;
import com.example.batchflow.repository.InstitutionRepository;
import com.example.batchflow.repository.UserRepository;
import com.example.batchflow.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SummaryService {

    private final InstitutionRepository institutionRepository;
    private final BatchRepository batchRepository;
    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    public ProgrammeSummaryResponse programmeSummary() {

        User actor = AuthUtil.currentUser();
        if (actor.getRole() != Role.PROGRAMME_MANAGER &&
            actor.getRole() != Role.MONITORING_OFFICER) {
            throw new ForbiddenException("Not allowed");
        }

        List<Institution> all = institutionRepository.findAll();

        List<InstitutionSummaryResponse> per = all.stream()
                .map(this::buildInstitutionSummary)
                .toList();

        return ProgrammeSummaryResponse.builder()
                .totalInstitutions(all.size())
                .totalBatches(per.stream().mapToLong(InstitutionSummaryResponse::getBatchCount).sum())
                .totalTrainers(per.stream().mapToLong(InstitutionSummaryResponse::getTrainerCount).sum())
                .totalStudents(per.stream().mapToLong(InstitutionSummaryResponse::getStudentCount).sum())
                .totalSessions(per.stream().mapToLong(InstitutionSummaryResponse::getSessionCount).sum())
                .totalAttendance(per.stream().mapToLong(InstitutionSummaryResponse::getAttendanceCount).sum())
                .presentCount(per.stream().mapToLong(InstitutionSummaryResponse::getPresentCount).sum())
                .absentCount(per.stream().mapToLong(InstitutionSummaryResponse::getAbsentCount).sum())
                .lateCount(per.stream().mapToLong(InstitutionSummaryResponse::getLateCount).sum())
                .perInstitution(per)
                .build();
    }

    public InstitutionSummaryResponse institutionSummary(Long institutionId) {

        User actor = AuthUtil.currentUser();

        Institution inst = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found"));

        boolean allowed = switch (actor.getRole()) {
            case PROGRAMME_MANAGER, MONITORING_OFFICER -> true;
            case INSTITUTION -> actor.getInstitution() != null &&
                    actor.getInstitution().getId().equals(institutionId);
            default -> false;
        };

        if (!allowed) throw new ForbiddenException("Not allowed");

        return buildInstitutionSummary(inst);
    }

    public BatchSummaryResponse batchSummary(Long batchId) {

        User actor = AuthUtil.currentUser();

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));

        boolean allowed = switch (actor.getRole()) {
            case PROGRAMME_MANAGER, MONITORING_OFFICER -> true;
            case INSTITUTION -> actor.getInstitution() != null &&
                    actor.getInstitution().getId().equals(batch.getInstitution().getId());
            case TRAINER -> batchRepository.existsTrainerInBatch(batchId, actor.getId());
            default -> false;
        };

        if (!allowed) throw new ForbiddenException("Not allowed");

        long studentCount = batchRepository.countStudentsByBatchId(batchId);
        long trainerCount = batchRepository.countTrainersByBatchId(batchId);
        long sessionCount = batchRepository.countSessionsByBatchId(batchId);

        long attendanceCount = attendanceRepository.countByBatchId(batchId);
        long present = attendanceRepository.countByBatchIdAndStatus(batchId, AttendanceStatus.PRESENT);
        long absent = attendanceRepository.countByBatchIdAndStatus(batchId, AttendanceStatus.ABSENT);
        long late = attendanceRepository.countByBatchIdAndStatus(batchId, AttendanceStatus.LATE);

        double rate = attendanceCount == 0 ? 0 :
                (double) present / attendanceCount * 100;

        return BatchSummaryResponse.builder()
                .batchId(batch.getId())
                .batchName(batch.getName())
                .studentCount(studentCount)
                .trainerCount(trainerCount)
                .sessionCount(sessionCount)
                .attendanceCount(attendanceCount)
                .presentCount(present)
                .absentCount(absent)
                .lateCount(late)
                .attendanceRate(Math.round(rate * 100.0) / 100.0)
                .build();
    }

    private InstitutionSummaryResponse buildInstitutionSummary(Institution inst) {

        Long id = inst.getId();

        long batchCount = batchRepository.countByInstitutionId(id);
        long trainerCount = userRepository.countByInstitutionIdAndRole(id, Role.TRAINER);
        long studentCount = userRepository.countByInstitutionIdAndRole(id, Role.STUDENT);
        long sessionCount = batchRepository.countSessionsByInstitutionId(id);

        long attendanceCount = attendanceRepository.countByInstitutionId(id);
        long present = attendanceRepository.countByInstitutionIdAndStatus(id, AttendanceStatus.PRESENT);
        long absent = attendanceRepository.countByInstitutionIdAndStatus(id, AttendanceStatus.ABSENT);
        long late = attendanceRepository.countByInstitutionIdAndStatus(id, AttendanceStatus.LATE);

        return InstitutionSummaryResponse.builder()
                .institutionId(id)
                .institutionName(inst.getName())
                .batchCount(batchCount)
                .trainerCount(trainerCount)
                .studentCount(studentCount)
                .sessionCount(sessionCount)
                .attendanceCount(attendanceCount)
                .presentCount(present)
                .absentCount(absent)
                .lateCount(late)
                .build();
    }
}