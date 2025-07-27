// src/main/java/com/portalsaude/dto/notificationDTO/NotificationResponseDTO.java
package com.portalsaude.dto.notificationDTO;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponseDTO {
    private Integer id;
    private Integer userId;
    private Integer type;
    private String title;
    private String description;
    private LocalDateTime dateTime;
    private Boolean seen;
}