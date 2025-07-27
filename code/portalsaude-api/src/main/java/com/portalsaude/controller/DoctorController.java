// src/main/java/com/portalsaude/controller/DoctorController.java
package com.portalsaude.controller;

import com.portalsaude.dto.doctorDTO.*;
import com.portalsaude.model.Doctor;
import com.portalsaude.service.DoctorService;
import com.portalsaude.service.StorageService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;


@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    @Autowired
    private final DoctorService doctorService;
    private final StorageService storageService;

    /**
     * GET /api/doctors/{id}
     */
    @GetMapping("/{id}")
    public DoctorResponseDTO getDoctorById(@PathVariable Integer id) {
        Doctor d = doctorService.getById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Médico não encontrado"));
        return toResponseDto(d);
    }

    /**
     * POST /api/doctors
     * Registar novo médico
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DoctorResponseDTO registerDoctor(
            @Valid @RequestBody DoctorRegistrationDTO dto
    ) {
        Doctor saved = doctorService.registerDoctor(
            dto.getPassword(),
            dto.getName(),
            dto.getSpecialization()
        );
        return toResponseDto(saved);
    }

    /**
     * PUT /api/doctors/{id}
     * Atualizar dados do médico
     */
    @PutMapping("/{id}")
    public DoctorResponseDTO updateDoctor(
            @PathVariable Integer id,
            @Valid @RequestBody DoctorUpdateDTO dto
    ) {
        Doctor updated = doctorService.updateDoctor(
            id,
            dto.getName(),
            dto.getSpecialization()
        );
        return toResponseDto(updated);
    }

    /**
     * PATCH /api/doctors/{id}/photo
     * Atualizar apenas a foto do médico
     */
     @PatchMapping(path = "/{id}/photo", consumes = "multipart/form-data")
    public DoctorResponseDTO updatePhoto(
            @PathVariable Integer id,
            @RequestParam("file") MultipartFile file
    ) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ficheiro vazio");
        }
        // 1) guarda no disco
        String filename = storageService.store(file);
        // 2) atualiza a entidade
        doctorService.updatePhoto(id, filename);

        // 3) retorna a entidade atualizada
        Doctor updatedDoctor = doctorService.getById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Doctor não encontrado"));
        return toResponseDto(updatedDoctor);
    }

    /**
     * DELETE /api/doctors/{id}
     * Eliminar médico
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDoctor(@PathVariable Integer id) {
        doctorService.deleteDoctor(id);
    }

    private DoctorResponseDTO toResponseDto(Doctor d) {
        return DoctorResponseDTO.builder()
            .id(d.getId())
            .name(d.getName())
            .specialization(d.getSpecialization())
            .photoUrl(d.getPhotoUrl())
            .build();
    }
}
