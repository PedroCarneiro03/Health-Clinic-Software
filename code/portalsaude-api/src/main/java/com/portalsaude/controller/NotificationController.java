package com.portalsaude.controller;

import com.portalsaude.dto.notificationDTO.NotificationRegistrationDTO;
import com.portalsaude.dto.notificationDTO.NotificationResponseDTO;
import com.portalsaude.model.Notification;
import com.portalsaude.service.NotificationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    @Autowired
    private final NotificationService notificationService;

    /**
     * GET /api/notifications/{id}
     */
    @GetMapping("/{id}")
    public NotificationResponseDTO getById(@PathVariable Integer id) {
        Notification n = notificationService.getById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Notificação não encontrada"));
        return toResponseDto(n);
    }

    /**
     * GET /api/notifications/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public List<NotificationResponseDTO> getByUser(@PathVariable Integer userId) {
        List<Notification> list = notificationService.getNotificationsByUserId(userId);
        return list.stream()
            .map(this::toResponseDto)
            .toList();
    }

    /**
     * POST /api/notifications
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NotificationResponseDTO register(
            @Valid @RequestBody NotificationRegistrationDTO dto
    ) {
        Notification saved = notificationService.registerNotification(
            dto.getUserId(),
            dto.getType(),
            dto.getTitle(),
            dto.getDescription()
        );
        return toResponseDto(saved);
    }

    /**
     * PATCH /api/notifications/{id}/seen
     */
    @PatchMapping("/{id}/seen")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAsSeen(@PathVariable Integer id) {
        notificationService.markAsSeen(id);
    }

    /**
     * DELETE /api/notifications/{id}
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        notificationService.deleteNotification(id);
    }

    private NotificationResponseDTO toResponseDto(Notification n) {
        return NotificationResponseDTO.builder()
            .id(n.getId())
            .userId(n.getUser().getId())
            .type(n.getType())
            .title(n.getTitle())
            .description(n.getDescription())
            .dateTime(n.getDateTime())
            .seen(n.getSeen())
            .build();
    }
}