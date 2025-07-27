package com.portalsaude.controller;

import com.portalsaude.io.AuthRequest;
import com.portalsaude.io.AuthResponse;
import com.portalsaude.service.UserService;
import com.portalsaude.utils.JwtUtil;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authManager;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    @PostMapping("/api/users")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody AuthRequest req) {

        // autentica com identifier (healthNumber ou id) + password
        authManager.authenticate(
          new UsernamePasswordAuthenticationToken(
             req.getIdentifier(), req.getPassword()
          )
        
        );

        UserDetails ud = userService.loadUserByUsername(req.getIdentifier());
        String token = jwtUtil.generateToken(ud);

        // Extrai o role e userId das claims do userDetails
        String rawRole = ud.getAuthorities().stream()
            .findFirst()
            .map(a -> a.getAuthority().replace("ROLE_", ""))
            .orElse("USER");
        // expiration em segundos
        long expiresIn = 60L * 60L * 10L;

        Integer userId = Integer.valueOf(ud.getUsername());
        AuthResponse resp = new AuthResponse(userId, rawRole, token, expiresIn);

        return ResponseEntity.ok(resp);
    }
}