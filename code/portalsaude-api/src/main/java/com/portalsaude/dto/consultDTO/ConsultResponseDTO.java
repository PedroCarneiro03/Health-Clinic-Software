// src/main/java/com/portalsaude/dto/consultDTO/ConsultResponseDTO.java
package com.portalsaude.dto.consultDTO;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultResponseDTO {
    private Integer id;
    private String link;
    private String startDate;  // "dd/MM/yyyy HH:mm"
    private Integer duration;
    private Boolean finished;
    private Integer doctorId;
    private Integer patientId;
    private String patientName;
    private String doctorName;
}