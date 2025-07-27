
// src/main/java/com/portalsaude/dto/doctorDTO/DoctorResponseDTO.java
package com.portalsaude.dto.doctorDTO;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorResponseDTO {
    private Integer id;
    private String name;
    private String specialization;
    private String photoUrl;
}