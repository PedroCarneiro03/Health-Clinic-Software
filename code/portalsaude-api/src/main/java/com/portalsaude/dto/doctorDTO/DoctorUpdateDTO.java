package com.portalsaude.dto.doctorDTO;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorUpdateDTO {
    @NotBlank(message = "Name é obrigatório")
    private String name;

    @NotBlank(message = "Specialization é obrigatória")
    private String specialization;
}