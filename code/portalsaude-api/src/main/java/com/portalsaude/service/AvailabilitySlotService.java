package com.portalsaude.service;

import com.portalsaude.event.DoctorCreatedEvent;
import com.portalsaude.model.*;
import com.portalsaude.repository.*;

import lombok.RequiredArgsConstructor;

import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.*;

@Service
@Transactional
@RequiredArgsConstructor
public class AvailabilitySlotService {

  private final AvailabilitySlotRepository slotRepo;
  private final DoctorRepository doctorRepo;
  private final ConsultService consultService;

  /**
   * Gera, para cada médico, todos os slots de 1h entre 8h e 18h
   * nos próximos 30 dias, mas so dias em que ainda não tenham nenhum slot criado.
   * Executa TODOS os dias à meia-noite.
   */
  @Scheduled(cron = "0 0 0 * * *")
  public void generateNext30DaysSlotsForAllDoctors() {
    LocalDate today = LocalDate.now();
    LocalDate end   = today.plusDays(30);

    // Para cada médico, chama a geração restrita
    doctorRepo.findAll().forEach(doc ->
      generateSlotsIfMissing(doc.getId(), today, end)
    );
  }

    /**
     * Cria apenas os slots (8h-18h, 1h) entre start e end
     * nos dias que ainda não tenham NENHUM slot associado a este médico.
     */
    public void generateSlotsIfMissing(
        Integer doctorId,
        LocalDate start,
        LocalDate end
    ) {
        // converte intervalos para datetimes
        LocalDateTime startDateTime = start.atStartOfDay();
        LocalDateTime endDateTime   = end.atTime(23, 59);

        // 1) datas em que já existem slots
        List<LocalDate> existingDays = slotRepo
          .findDistinctStartDatesByDoctorIdBetween(doctorId, startDateTime, endDateTime);

        // 2) para cada dia no intervalo, se não existir slot, gera-o
        for (LocalDate day = start; !day.isAfter(end); day = day.plusDays(1)) {
            if (!existingDays.contains(day)) {
                createDailySlots(doctorId, day);
            }
        }
    }

    /**  
     * Escuta o evento de médico criado e gera 30 dias à frente, sem duplicados.  
     */
    @EventListener
    public void onDoctorCreated(DoctorCreatedEvent evt) {
        LocalDate today = LocalDate.now();
        LocalDate end   = today.plusDays(30);
        generateSlotsIfMissing(evt.getDoctorId(), today, end);
    }

    /**
     * Cria os 10 slots de 1h (8→9, 9→10 … 17→18) para um único dia.
     */
    private void createDailySlots(Integer doctorId, LocalDate day) {
        Doctor doc = doctorRepo.findById(doctorId)
        .orElseThrow(() -> new IllegalArgumentException("Médico não encontrado"));
        LocalDateTime t = day.atTime(8,0);
        LocalDateTime endOfDay = day.atTime(18,0);

        List<AvailabilitySlot> slots = new ArrayList<>();
        while (t.isBefore(endOfDay)) {
        AvailabilitySlot s = new AvailabilitySlot();
        s.setDoctor(doc);
        s.setStart(t);
        s.setEndDate(t.plusHours(1));
        s.setStatus(SlotStatus.BLOCKED);
        slots.add(s);
        t = t.plusHours(1);
        }
        slotRepo.saveAll(slots);
    }

    public List<AvailabilitySlot> listWeeklySlots(Integer doctorId, LocalDate start) {
        LocalDateTime from = start.atStartOfDay();
        LocalDateTime to   = start.plusDays(6).atTime(23, 59);
        return slotRepo.findByDoctorIdAndStartBetween(doctorId, from, to);
    }

    /** Médico torna slot disponível (BLOCKED → FREE) */
    public void freeSlot(Integer slotId) {
        AvailabilitySlot slot = slotRepo.findById(slotId)
        .orElseThrow(() -> new IllegalArgumentException("Slot não existe"));
        slot.setStatus(SlotStatus.FREE);
        slotRepo.save(slot);
    }

    /** Médico bloqueia slot que estava free (FREE → BLOCKED) */
    public void blockSlot(Integer slotId) {
        AvailabilitySlot slot = slotRepo.findById(slotId)
        .orElseThrow(() -> new IllegalArgumentException("Slot não existe"));
        slot.setStatus(SlotStatus.BLOCKED);
        slotRepo.save(slot);
    }

    /** Paciente reserva slot para uma consulta (FREE → BOOKED + associa consultId) */
    public void bookSlot(Integer slotId, Integer consultId) {
        AvailabilitySlot slot = slotRepo.findById(slotId)
        .orElseThrow(() -> new IllegalArgumentException("Slot não existe"));
        if (slot.getStatus() != SlotStatus.FREE) {
        throw new IllegalStateException("Slot não está livre");
        }
        slot.setStatus(SlotStatus.BOOKED);
        slot.setConsultId(consultId);
        slotRepo.save(slot);
    }

    /** Cancelar consulta (BOOKED → FREE + limpa consultId) */
    public void cancelSlot(Integer slotId) {
        AvailabilitySlot slot = slotRepo.findById(slotId)
        .orElseThrow(() -> new IllegalArgumentException("Slot não existe"));
        if (slot.getStatus() != SlotStatus.BOOKED) {
        throw new IllegalStateException("Slot não está reservado");
        }
        slot.setStatus(SlotStatus.FREE);
        Integer consultId = slot.getConsultId();
        if (consultId != null) {
            consultService.deleteConsult(consultId);
        }
        slot.setConsultId(null);
        slotRepo.save(slot);
    }

        /**
         * GET diário de slots livres (status FREE) para um médico num dia.
         */
        @Transactional(readOnly = true)
        public List<AvailabilitySlot> listFreeSlots(
            Integer doctorId,
            LocalDate date
        ) {
            LocalDateTime from = date.atStartOfDay();
            LocalDateTime to   = date.atTime(23, 59);

            // usa a query findByDoctorIdAndStatusAndStartBetween(...)
            return slotRepo.findByDoctorIdAndStatusAndStartBetween(
                doctorId,
                SlotStatus.FREE,
                from,
                to
            );
        }
}
