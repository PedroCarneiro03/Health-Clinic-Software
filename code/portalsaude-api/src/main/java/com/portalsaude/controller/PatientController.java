package com.portalsaude.controller;

import com.portalsaude.dto.patientDTO.PatientRegistrationDTO;
import com.portalsaude.dto.patientDTO.PatientResponseDTO;
import com.portalsaude.dto.patientDTO.PatientUpdateDTO;
import com.portalsaude.model.Patient;
import com.portalsaude.service.PatientService;
import com.portalsaude.service.StorageService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    @Autowired
    private PatientService patientService;
    @Autowired
    private StorageService storageService;

    /**
     * GET /api/patients/{id}
     */
    @GetMapping("/{id}")
    public PatientResponseDTO getPatientById(@PathVariable Integer id) {
        Patient p = patientService.getById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Paciente não encontrado"));


        return toResponseDto(p);
    }

    /**
     * GET /api/patients/doctor/{doctorId}
     */
    @GetMapping("/doctor/{doctorId}")
    public List<PatientResponseDTO> getPatientsByDoctor(@PathVariable Integer doctorId) {
        List<Patient> list = patientService.getPatientsByDoctorId(doctorId);
        return list.stream()
            .map(this::toResponseDto)
            .toList();
    }


    /**
     * POST /api/patients
     * Registar novo paciente
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PatientResponseDTO registerPatient(
            @Valid @RequestBody PatientRegistrationDTO dto
    ) {
        Patient saved = patientService.registerPatient(
            dto.getHealthNumber(),
            dto.getEmail(),
            dto.getPassword(),
            dto.getName(),
            LocalDate.parse(dto.getBirthdate()),
            dto.getGender(),
            dto.getPhoneNumber(),
            dto.getNationality()
        );
        return toResponseDto(saved);
    }

    /**
     * PUT /api/patients/{id}
     * Atualizar dados principais do paciente
     */
    @PutMapping("/{id}")
    public PatientResponseDTO updatePatient(
            @PathVariable Integer id,
            @Valid @RequestBody PatientUpdateDTO dto
    ) {
        Patient updated = patientService.updatePatient(
            id,
            dto.getName(),
            dto.getEmail(),
            dto.getPhoneNumber(),
            dto.getHeight(),
            dto.getWeight()
        );
        return toResponseDto(updated);
    }

    /**
     * PATCH /api/patients/{id}/photo
     */
    @PatchMapping(path = "/{id}/photo", consumes = "multipart/form-data")
    public PatientResponseDTO updatePhoto(
            @PathVariable Integer id,
            @RequestParam("file") MultipartFile file
    ) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ficheiro vazio");
        }
        // 1) guarda no disco
        String filename = storageService.store(file);
        // 2) atualiza a entidade
        patientService.updatePhoto(id, filename);

        // 3) retorna a entidade atualizada
        Patient updatedPatient = patientService.getById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Paciente não encontrado"));
        return toResponseDto(updatedPatient);
    }

    /**
     * PATCH /api/patients/{id}/vaccines-book
     */
    @PatchMapping(path = "/{id}/vaccines-book", consumes = "multipart/form-data")

    public PatientResponseDTO updateVaccinesBook(
            @PathVariable Integer id,
            @RequestParam("file") MultipartFile file
    ) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ficheiro vazio");
        }
        // 1) guarda no disco
        String filename = storageService.store(file);
        // 2) atualiza a entidade
        patientService.updateVaccinesBookUrl(id, filename);

        // 3) retorna a entidade atualizada
        Patient updatedPatient = patientService.getById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Paciente não encontrado"));
        return toResponseDto(updatedPatient);
    }

    /**
     * PATCH /api/patients/{id}/doctor/{doctorId}
     * Reatribuir médico
     */
    @PatchMapping("/{id}/doctor/{doctorId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void assignDoctor(
            @PathVariable Integer id,
            @PathVariable Integer doctorId
    ) {
        patientService.assignDoctor(id, doctorId);
    }

    /**
     * DELETE /api/patients/{id}
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePatient(@PathVariable Integer id) {
        patientService.deletePatient(id);
    }


    private PatientResponseDTO toResponseDto(Patient p) {
        return new PatientResponseDTO(
            p.getId(),
            p.getHealthNumber(),
            p.getEmail(),
            p.getName(),
            p.getBirthdate().toString(),
            p.getGender(),
            p.getPhoneNumber(),
            p.getNationality(),
            p.getHeight(),
            p.getWeight(),
            p.getPhotoUrl(),
            p.getVaccinesBookUrl(),
            p.getDoctor().getId()
        );
    }
}
