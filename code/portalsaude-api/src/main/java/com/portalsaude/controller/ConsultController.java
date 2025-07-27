package com.portalsaude.controller;

import com.portalsaude.dto.consultDTO.*;
import com.portalsaude.model.Consult;
import com.portalsaude.service.ConsultService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/consults")
@RequiredArgsConstructor
public class ConsultController {

    @Autowired
    private final ConsultService consultService;

    /** GET /api/consults/{id} */
    @GetMapping("/{id}")
    public ConsultResponseDTO getById(@PathVariable Integer id) {
        Consult c = consultService.getById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Consulta não encontrada"));
        return toResponseDto(c);
    }

    /** GET /api/consults/patient/{patientId} */
    @GetMapping("/patient/{patientId}")
    public List<ConsultResponseDTO> getByPatient(@PathVariable Integer patientId) {
        List<Consult> list = consultService.getConsultsByPatientId(patientId);
        return list.stream().map(this::toResponseDto).toList();
    }

    /** GET /api/consults/doctor/{doctorId} */
    @GetMapping("/doctor/{doctorId}")
    public List<ConsultResponseDTO> getByDoctor(@PathVariable Integer doctorId) {
        List<Consult> list = consultService.getConsultsByDoctorId(doctorId);
        return list.stream().map(this::toResponseDto).toList();
    }

    /** GET /api/consults/link/{consultId} */
    @GetMapping("/link/{consultId}")
    public ConsultLinkResponseDTO getLink(@PathVariable Integer consultId) {
        String link = consultService.getLink(consultId);
        return new ConsultLinkResponseDTO(link);
    }

    /** POST /api/consults */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ConsultResponseDTO register(
            @Valid @RequestBody ConsultRegistrationDTO dto
    ) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        LocalDateTime startDate = LocalDateTime.parse(dto.getStartDate(), formatter);

        Consult saved = consultService.registerConsult(
            dto.getDoctorId(),
            dto.getPatientId(),
            startDate
        );
        return toResponseDto(saved);
    }

    /** PATCH /api/consults/{id}/finish */
    @PatchMapping("/{id}/finish")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markFinished(@PathVariable Integer id) {
        consultService.markFinished(id);
    }

    /** DELETE /api/consults/{id} */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        consultService.deleteConsult(id);
    }

    private ConsultResponseDTO toResponseDto(Consult c) {
        return ConsultResponseDTO.builder()
            .id(c.getId())
            .link(c.getLink())
            .startDate(c.getStartDate().toString())
            .duration(c.getDuration())
            .finished(c.getFinished())
            .doctorId(c.getDoctor().getId())
            .patientId(c.getPatient().getId())
            .patientName(c.getPatient().getName())
            .doctorName(c.getDoctor().getName())
            .build();
    }
}
