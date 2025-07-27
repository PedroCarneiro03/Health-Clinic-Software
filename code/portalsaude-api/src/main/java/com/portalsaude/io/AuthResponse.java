package com.portalsaude.io;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {

    private Integer id;
    private String role;
    private String token;
    private long expiresIn;
    
}
