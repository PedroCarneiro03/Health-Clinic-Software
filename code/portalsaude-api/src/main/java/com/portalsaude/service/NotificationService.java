package com.portalsaude.service;

import com.portalsaude.model.Notification;
import com.portalsaude.model.User;
import com.portalsaude.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class NotificationService {
    private final NotificationRepository repo;
    private final UserService userService;

    public NotificationService(NotificationRepository repo, UserService userService) {
        this.repo = repo;
        this.userService = userService;
    }

    /**
     * Obtém uma notificação com um ID.
     */
    @Transactional(readOnly = true)
    public Optional<Notification> getById(Integer id) {
        return repo.findById(id);
    }

    /**
     * Regista uma nova notificação.
     */
    public Notification registerNotification(Integer userId, Integer type, String title, String description) {
        Assert.notNull(userId, "Id do user é obrigatório");
        Assert.notNull(type, "Tipo é obrigatório");
        Assert.hasText(title, "Título é obrigatório");
        Assert.isTrue(type >= 0 && type <= 4, "Tipo deve ser 0, 1, 2, 3 ou 4");

        User user = userService.getById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User não encontrado com o id: " + userId));

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type);
        notification.setTitle(title);
        notification.setDescription(description);
        notification.setDateTime(LocalDateTime.now());
        notification.setSeen(false);

        return repo.save(notification);
    }

    /**
     * Marca uma notificação como vista.
     */
    public void markAsSeen(Integer id) {
        Notification n = repo.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Notificação não encontrada com id: " + id));

        n.setSeen(true);
        repo.save(n);
    }

    /**
     * Lista todas as notificações de um user.
     */
    @Transactional(readOnly = true)
    public List<Notification> getNotificationsByUserId(Integer userId) {
        Assert.notNull(userId, "Id do user é obrigatório");
        return repo.findByUserId(userId);
    }

    /**
     * Remove uma notificação.
     */
    public void deleteNotification(Integer id) {
        if (!repo.existsById(id)) {
            throw new IllegalArgumentException("Notificação não encontrada com id: " + id);
        }
        repo.deleteById(id);
    }
}