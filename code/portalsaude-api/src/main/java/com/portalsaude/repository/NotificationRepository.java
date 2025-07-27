package com.portalsaude.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.portalsaude.model.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    /**
     * listar todas as notificações de um user
     * @param users id do user
     * @return
     */
    List<Notification> findByUserId(Integer user);

}
