package com.portalsaude.dto.examDTO;

import lombok.*;
import java.util.List;
import java.util.ArrayList;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class ExamListResponse {
    private List<ExamResponseDTO> exams = new ArrayList<>();
}
