package com.portalsaude.controller;

import com.portalsaude.dto.prescriptionDTO.PrescriptionDTO;
import com.portalsaude.dto.prescriptionDTO.PrescriptionResponseDTO;
import com.portalsaude.dto.prescriptionDTO.PrescriptionMedicationResponseDTO;
import com.portalsaude.model.Prescription;
import com.portalsaude.model.PrescriptionMedication;
import com.portalsaude.service.PrescriptionService;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    @Autowired
    private PrescriptionService prescriptionService;

    /**
     * Obtém todas as prescrições associadas a um paciente.
     */ 
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<PrescriptionResponseDTO>> getPrescriptionsByPatientId(@PathVariable Integer patientId) {
        List<Prescription> prescriptions = prescriptionService.getPrescriptionsByPatientId(patientId);
        List<PrescriptionResponseDTO> response = prescriptions.stream()
                .map(this::toResponseDto)
                .toList();
        return ResponseEntity.ok(response);
    }

    /**
     * Obtém uma prescrição específica pelo ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PrescriptionResponseDTO> getPrescriptionById(@PathVariable Integer id) {
        Optional<Prescription> prescription = prescriptionService.getById(id);
        if (prescription.isPresent()) {
            PrescriptionResponseDTO response = toResponseDto(prescription.get());
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    /**
     * Cria uma nova prescrição.
     */
    @PostMapping
    public ResponseEntity<PrescriptionResponseDTO> createPrescription(@RequestBody PrescriptionDTO prescriptionDTO) {
        try {
            Prescription prescription = prescriptionService.createPrescription(prescriptionDTO);
            PrescriptionResponseDTO response = toResponseDto(prescription);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    /**
     * Atualiza uma prescrição existente.
     */
    @PutMapping("/{id}")
    public ResponseEntity<PrescriptionResponseDTO> updatePrescription(
            @PathVariable Integer id, 
            @RequestBody PrescriptionDTO prescriptionDTO) {
        try {
            Prescription updatedPrescription = prescriptionService.updatePrescription(id, prescriptionDTO);
            PrescriptionResponseDTO response = toResponseDto(updatedPrescription);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    /**
     * Gera um PDF da prescrição.
     */
    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> getPrescriptionPdf(@PathVariable Integer id) {
        byte[] pdf = prescriptionService.generatePrescriptionPdf(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=receita.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    /**
     * Elimina uma prescrição pelo ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePrescription(@PathVariable Integer id) {
        try {
            prescriptionService.deletePrescription(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Passa de Prescription para PrescriptionResponseDTO.
     */ 
    private PrescriptionResponseDTO toResponseDto(Prescription prescription) {
        // Get medications for this prescription
        List<PrescriptionMedication> medications = prescriptionService.getMedicationsByPrescriptionId(prescription.getId());
        
        List<PrescriptionMedicationResponseDTO> medicationDtos = medications.stream()
                .map(med -> new PrescriptionMedicationResponseDTO(
                        med.getId(), 
                        med.getMedication(), 
                        med.getDosage(), 
                        med.getFrequency(), 
                        med.getDuration()))
                .toList();
        
        return new PrescriptionResponseDTO(
                prescription.getId(),
                prescription.getDoctor().getName(),
                prescription.getPatient().getId(),
                prescription.getDate(),
                prescription.getAdditionalInformation(),
                medicationDtos);
    }
}