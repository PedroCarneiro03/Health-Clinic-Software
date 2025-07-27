package com.portalsaude.dto.examDTO;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamRegistrationListDTO {
    private List<ExamRegistrationDTO> exams;
}
