// 1. Serviço de Agendamento de Notificações
package com.portalsaude.service;

import com.portalsaude.model.Consult;
import com.portalsaude.repository.ConsultRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationSchedulerService {

    private final ConsultRepository consultRepository;
    private final NotificationService notificationService;

     /**
      * Executa a cada minuto para verificar consultas que precisam de notificação
      */
     @Scheduled(cron = "0 * * * * *") // A cada minuto
     @Transactional
     public void checkUpcomingConsults() {
  
         // Busca consultas que começam em 15 minutos 
         List<Consult> upcomingConsults = consultRepository.findByStartDateHourIn15min(
             LocalDateTime.now().toLocalDate(),
             LocalDateTime.now().getHour(),
             LocalDateTime.now().getMinute() + 15
         );
         for (Consult consult : upcomingConsults) {
             // Verifica se a consulta ainda não foi finalizada
             if (!consult.getFinished()) {
                 log.info("Enviando notificação para consulta ID: {}", consult.getId());
                 sendConsultaNotification(consult);
             } else {
                 log.info("Consulta ID: {} já foi finalizada, não enviando notificação.", consult.getId());
             }
         }
     }

    private void sendConsultaNotification(Consult consult) {
        String title = "Consulta em 15 minutos";
        String description = String.format(
            "A sua consulta com o Dr(a). %s está marcada para %s. Não se esqueça!",
            consult.getDoctor().getName(),
            consult.getStartDate().toString()
        );

        notificationService.registerNotification(
            consult.getPatient().getId(),
            2, // Tipo 2 para notificação de consulta
            title,
            description
        );
    }
}






