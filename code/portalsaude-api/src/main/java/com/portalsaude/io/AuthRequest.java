package com.portalsaude.io;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AuthRequest {
    
    @NotBlank(message="O identificador é obrigatório")
    private String identifier;   // pode ser healthNumber ou id do doctor
    @NotBlank(message="A password é obrigatória")
    private String password;
}
