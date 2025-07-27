package com.portalsaude.controller;

import com.portalsaude.dto.userDTO.PasswordChangeDTO;
import com.portalsaude.dto.userDTO.UserResponseDTO;
import com.portalsaude.model.User;
import com.portalsaude.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;


@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * GET /api/users/{id}
     * Obter informações básicas de um utilizador (sem password)
     */
    @GetMapping("/{id}")
    public UserResponseDTO getUserById(@PathVariable Integer id) {
        User u = userService.getById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Utilizador não encontrado"));
        return new UserResponseDTO(u.getId(), u.getType());
    }

    /**
     * PATCH /api/users/{id}/password
     * Alterar password do utilizador
     */
    @PatchMapping("/{id}/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changeUserPassword(
            @PathVariable Integer id,
            @Valid @RequestBody PasswordChangeDTO dto
    ) {
        try {
            userService.changePassword(id, dto.getNewPassword());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
        }
    }

    /**
     * DELETE /api/users/{id}
     * Eliminar utilizador
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Integer id) {
        try {
            userService.deleteUser(id);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, ex.getMessage(), ex);
        }
    }
}
