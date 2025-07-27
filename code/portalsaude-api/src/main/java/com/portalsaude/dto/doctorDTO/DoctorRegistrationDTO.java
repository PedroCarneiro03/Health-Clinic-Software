package com.portalsaude.dto.doctorDTO;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorRegistrationDTO {
    @NotBlank(message = "Password é obrigatória")
    @Size(min = 6, message = "Password deve ter pelo menos 6 caracteres")
    private String password;

    @NotBlank(message = "Name é obrigatório")
    private String name;

    @NotBlank(message = "Specialization é obrigatória")
    private String specialization;
}
