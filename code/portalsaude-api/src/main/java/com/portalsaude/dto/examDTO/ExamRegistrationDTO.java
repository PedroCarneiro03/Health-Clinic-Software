package com.portalsaude.dto.examDTO;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamRegistrationDTO {
    @NotNull(message = "doctorId é obrigatório")
    @Min(value = 1, message = "doctorId inválido")
    private Integer doctorId;

    @NotNull(message = "patientId é obrigatório")
    @Min(value = 1, message = "patientId inválido")
    private Integer patientId;

    @NotBlank(message = "name é obrigatória")
    private String name;

    private String observations;

    private String type;
}