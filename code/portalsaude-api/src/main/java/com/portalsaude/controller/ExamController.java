package com.portalsaude.controller;

import com.portalsaude.dto.examDTO.*;
import com.portalsaude.model.Exam;
import com.portalsaude.service.DoctorService;
import com.portalsaude.service.ExamService;
import com.portalsaude.service.StorageService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
public class ExamController {

    private final ExamService examService;
    private final StorageService storageService;
    private final DoctorService doctorService;

    /**
     * GET /api/exams/patient/{patientId}
     */
    @GetMapping("/patient/{patientId}")
    public List<ExamResponseDTO> getExamsByPatient(@PathVariable Integer patientId) {
        List<Exam> list = examService.getExamsByPatientId(patientId);
        return list.stream()
            .map(this::toResponseDto)
            .toList();
    }

    /**
     * GET /api/exams/{id}
     */
    @GetMapping("/{id}")
    public ExamResponseDTO getExamById(@PathVariable Integer id) {
        Exam e = examService.getById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Exame não encontrado"));
        return toResponseDto(e);
    }

    /**
     * POST /api/exams
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExamListResponse registerExam(
            @Valid @RequestBody ExamRegistrationListDTO dto
    ) {
        ExamListResponse response = new ExamListResponse();
        List <ExamRegistrationDTO> exams = dto.getExams();
        for (ExamRegistrationDTO examDto : exams) {
            if (examDto.getDoctorId() == null || examDto.getPatientId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID do médico ou paciente não pode ser nulo");
            }
            Exam saved = examService.registerExam(examDto.getDoctorId(), examDto.getPatientId(), examDto.getName(), examDto.getObservations(), examDto.getType());
            response.getExams().add(toResponseDto(saved));
        }
        return response;
    }

    /**
     * PATCH /api/exams/{id}/file
     */
    @PatchMapping(path = "/{id}/file", consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void addFileUrl(
            @PathVariable Integer id,
            @RequestParam("file") MultipartFile file
    ) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ficheiro vazio");
        }
        // 1) guarda no disco
        String filename = storageService.store(file);
        // 2) atualiza a entidade
        examService.addFileUrl(id, filename);
    }

    /**
     * GET /api/exams/{id}/file
     */
    @GetMapping("/{id}/file")
    public String getFileUrl(@PathVariable Integer id) {
        return examService.getFileUrl(id);
    }

    /**
     * DELETE /api/exams/{id}
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteExam(@PathVariable Integer id) {
        examService.deleteExam(id);
    }

    private ExamResponseDTO toResponseDto(Exam e) {
        return ExamResponseDTO.builder()
            .id(e.getId())
            .name(e.getName())
            .datePrescribed(e.getDatePrescribed())
            .fileUrl(e.getFileUrl())
            .doctorId(e.getDoctor().getId())
            .patientId(e.getPatient().getId())
            .observations(e.getObservations())
            .type(e.getType())
            .doctorName(e.getDoctor().getName())
            .build();
    }
}
