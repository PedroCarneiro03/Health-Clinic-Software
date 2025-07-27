// src/main/java/com/portalsaude/dto/notificationDTO/NotificationRegistrationDTO.java
package com.portalsaude.dto.notificationDTO;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationRegistrationDTO {
    @NotNull(message = "userId é obrigatório")
    @Min(value = 1, message = "userId inválido")
    private Integer userId;

    @NotNull(message = "type é obrigatório")
    private Integer type;  // por exemplo: 0=INFO, 1=ALERT, etc.

    @NotBlank(message = "title é obrigatório")
    private String title;

    @NotBlank(message = "description é obrigatória")
    private String description;
}