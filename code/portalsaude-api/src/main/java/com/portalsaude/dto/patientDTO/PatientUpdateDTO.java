package com.portalsaude.dto.patientDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientUpdateDTO {
  private String name;
  private String phoneNumber;
  private String email;
  private Integer height;
  private Integer weight;
}
