package com.portalsaude.dto.prescriptionDTO;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionDTO {
    private Integer doctorId;
    private Integer patientId;
    private String date;
    private String additionalInformation;
    private List<PrescriptionMedicationDTO> medications; // Lista de medicamentos

}
