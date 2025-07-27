package com.portalsaude.dto.patientDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientRegistrationDTO {
  private Integer healthNumber;
  private String password;
  private String email;
  private String name;
  private String birthdate;
  private String gender;
  private String phoneNumber;
  private String nationality;
}
