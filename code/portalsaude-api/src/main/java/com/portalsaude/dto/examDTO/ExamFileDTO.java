
// src/main/java/com/portalsaude/dto/examDTO/ExamFileUrlDTO.java
package com.portalsaude.dto.examDTO;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamFileDTO {
    @NotBlank(message = "fileUrl é obrigatória")
    private String fileUrl;
}