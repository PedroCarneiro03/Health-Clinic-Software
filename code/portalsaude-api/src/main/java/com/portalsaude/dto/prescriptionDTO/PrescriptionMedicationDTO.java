package com.portalsaude.dto.prescriptionDTO;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionMedicationDTO {
    private String medication;  
    private String dosage;
    private String frequency;
    private String duration;
}
