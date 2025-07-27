package com.portalsaude.dto.patientDTO;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientResponseDTO {
  private Integer id;
  private Integer healthNumber;
  private String email;
  private String name;
  private String birthdate;
  private String gender;
  private String phoneNumber;
  private String nationality;
  private Integer height;
  private Integer weight;
  private String photoUrl;
  private String vaccinesBookUrl;
  private Integer doctorId;
}
