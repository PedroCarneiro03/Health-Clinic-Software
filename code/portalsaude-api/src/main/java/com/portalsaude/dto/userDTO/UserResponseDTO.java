package com.portalsaude.dto.userDTO;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {
    private int id;
    private String type;          // ex.: "DOCTOR" ou "PATIENT"
}