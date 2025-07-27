package com.portalsaude.dto.prescriptionDTO;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class PrescriptionResponseDTO {
    private Integer id;
    private String doctorName;
    private Integer patientId;
    private LocalDate date;
    private String additionalInformation;
    private List<PrescriptionMedicationResponseDTO> medications; // Lista de medicamentos
}
