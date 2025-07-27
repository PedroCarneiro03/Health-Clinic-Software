package com.portalsaude.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.portalsaude.model.Consult;
import com.portalsaude.model.Doctor;
import com.portalsaude.model.Patient;
import com.portalsaude.repository.ConsultRepository;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.util.Assert;


@Service
@Transactional
public class ConsultService {
    private final ConsultRepository repo;
    private final PatientService patientService;
    private final DoctorService doctorService;
    private final NotificationService notificationService;

    public ConsultService(ConsultRepository repo, PatientService patientService, DoctorService doctorService, NotificationService notificationService) {
        this.repo = repo;
        this.patientService = patientService;
        this.doctorService = doctorService;
        this.notificationService = notificationService;
    }

    /**
     * Lista todas as consultas de um paciente.
     */
    @Transactional(readOnly = true)
    public List<Consult> getConsultsByPatientId(Integer patientId) {
        Assert.notNull(patientId, "Id do paciente é obrigatório");
        return repo.findByPatientId(patientId);
    }

    /**
     * Lista todas as consultas de um médico.
     */
    @Transactional(readOnly = true)
    public List<Consult> getConsultsByDoctorId(Integer doctorId) {
        Assert.notNull(doctorId, "Id do médico é obrigatório");
        return repo.findByDoctorId(doctorId);
    }

    /**
     * Obtém uma consulta por ID.
     */
    @Transactional(readOnly = true)
    public Optional<Consult> getById(Integer id) {
        return repo.findById(id);
    }

    /**
     * Regista uma nova consulta.
     */
    public Consult registerConsult(Integer doctorId, Integer patientId, LocalDateTime dateStart) {
        Assert.notNull(doctorId, "Id do médico é obrigatório");
        Assert.notNull(patientId, "Id do paciente é obrigatório");
        Assert.notNull(dateStart, "Data de início é obrigatória");
        Assert.isTrue(!dateStart.isBefore(LocalDateTime.now()), "Data de início não pode ser no passado");

        Doctor doctor = doctorService.getById(doctorId)
            .orElseThrow(() -> new IllegalArgumentException("Médico não encontrado com id: " + doctorId));
        Patient patient = patientService.getById(patientId)
            .orElseThrow(() -> new IllegalArgumentException("Paciente não encontrado com id: " + patientId));

        Consult consult = new Consult();
        consult.setDoctor(doctor);
        consult.setPatient(patient);
        consult.setStartDate(dateStart);

        String roomId = UUID.randomUUID().toString();
        String link   = "https://meet.jit.si/" + roomId;
        consult.setLink(link);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        String startDate = dateStart.format(formatter);

        notificationService.registerNotification(
            patientId,
            3, 
            "Consulta Agendada",
            "A sua consulta com Dr. " + doctor.getName() + " foi agendada para " + startDate
        );

        notificationService.registerNotification(
            doctorId,
            3, 
            "Consulta Agendada",
            "A sua consulta com " + patient.getName() + " foi agendada para " + startDate
        );

        return repo.save(consult);
    }

    /**
     * Adiciona um link para a consulta.
     */
    public void setLink(Integer id, String link){
        Assert.hasText(link, "Link da consulta é obrigatório");
        Consult d = repo.findById(id)
                     .orElseThrow(() -> new RuntimeException("Consulta não encontrada"));
        
        d.setLink(link);
        repo.save(d);
    }

    /**
     * Retorna um link para a consulta.
     */
    public String getLink(Integer id){
        Assert.notNull(id, "id da consulta é obrigatório");
        Consult d = repo.findById(id)
                     .orElseThrow(() -> new RuntimeException("Consulta não encontrada"));
        
        return d.getLink();
    }


    /**
     * Marca uma consulta como terminada (cancelada é igual).
     */
    public void markFinished(Integer id) {
        Consult d = repo.findById(id).orElseThrow(() -> new RuntimeException("Consulta não encontrada"));
        d.setFinished(true);
        repo.save(d);
    }

    /**
     * Remove uma consulta.
     */
    public void deleteConsult(Integer id) {
        if (!repo.existsById(id)) {
            throw new IllegalArgumentException("Consulta não encontrada com id: " + id);
        }
        repo.deleteById(id);
    }
}
