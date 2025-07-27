package com.portalsaude.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.portalsaude.dto.availabilitySlotDTO.SlotDTO;
import com.portalsaude.dto.availabilitySlotDTO.WeeklySlotsDTO;
import com.portalsaude.service.AvailabilitySlotService;
import com.portalsaude.service.PatientService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/availability")
@RequiredArgsConstructor
public class AvailabilitySlotController {

    private final AvailabilitySlotService availabilitySlotService;
    private final PatientService patientService;


    /** Médico liberta slot */
    // PATCH /api/availability/slots/{slotId}/free
    @PatchMapping("/slots/{slotId}/free")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void freeSlot(@PathVariable Integer slotId) {
        availabilitySlotService.freeSlot(slotId);
    }

    /** Médico bloqueia slot */
    // PATCH /api/availability/slots/{slotId}/block
    @PatchMapping("/slots/{slotId}/block")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void blockSlot(@PathVariable Integer slotId) {
        availabilitySlotService.blockSlot(slotId);
    }

    /** Paciente reserva slot (usa consultId retornado pelo ConsultService) */
    // PATCH /api/availability/slots/{slotId}/book/{consultId}
    @PatchMapping("/slots/{slotId}/book/{consultId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void bookSlot(
        @PathVariable Integer slotId,
        @PathVariable Integer consultId
    ) {
        availabilitySlotService.bookSlot(slotId, consultId);
    }

    /** Pacient/medico cancela reserva */
    // PATCH /api/availability/slots/{slotId}/cancel
    @PatchMapping("/slots/{slotId}/cancel")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancelSlot(@PathVariable Integer slotId) {
        availabilitySlotService.cancelSlot(slotId);
    }

    /** Listar slots livres num dia */
    @GetMapping("/doctors/{docId}")
    public List<SlotDTO> listFree(
        @PathVariable Integer docId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return availabilitySlotService.listFreeSlots(docId, date)
            .stream()
            .map(s -> {
                String patientName = patientService.getPatientNameById(s.getConsultId());
                return new SlotDTO(
                    s.getId(),
                    s.getStart().toString(),
                    s.getEndDate().toString(),
                    s.getStatus().name(),
                    s.getConsultId(),
                    patientName
                );
            })
            .toList();
    }

    /** Listar slots todas numa semana */
    @GetMapping("/doctors/{docId}/week")
    public WeeklySlotsDTO listWeek(
        @PathVariable Integer docId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start
    ) {
        var slots = availabilitySlotService.listWeeklySlots(docId, start)
            .stream()
            .map(s -> {
                // buscar nome do paciente (se houver consultId)
                String patientName = patientService.getPatientNameById(s.getConsultId());
                return new SlotDTO(
                    s.getId(),
                    s.getStart().toString(),
                    s.getEndDate().toString(),
                    s.getStatus().name(),
                    s.getConsultId(),
                    patientName
                );
            })
            .toList();
        return new WeeklySlotsDTO(slots);
    }
}

