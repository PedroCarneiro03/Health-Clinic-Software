// src/main/java/com/portalsaude/dto/examDTO/ExamResponseDTO.java
package com.portalsaude.dto.examDTO;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamResponseDTO {
    private Integer id;
    private String name;
    private LocalDate datePrescribed;
    private String fileUrl;
    private Integer doctorId;
    private Integer patientId;
    private String observations;
    private String type;
    private String doctorName;
}