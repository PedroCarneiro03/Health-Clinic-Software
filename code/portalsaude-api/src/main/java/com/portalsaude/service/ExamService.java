package com.portalsaude.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.portalsaude.model.Doctor;
import com.portalsaude.model.Exam;
import com.portalsaude.model.Patient;
import com.portalsaude.repository.ExamRepository;
import org.springframework.util.Assert;
import org.springframework.data.domain.Sort;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Comparator;

@Service
@Transactional
public class ExamService {
    private final ExamRepository repo;
    private final PatientService patientService;
    private final DoctorService doctorService;

    public ExamService(ExamRepository repo, PatientService patientService, DoctorService doctorService) {
        this.repo = repo;
        this.patientService = patientService;
        this.doctorService = doctorService;
    }

    /**
     * Lista todos os exames de um paciente.
     */
    @Transactional(readOnly = true)
    public List<Exam> getExamsByPatientId(Integer patientId) {
        Assert.notNull(patientId, "Id do paciente é obrigatório");
        return repo.findByPatientId(patientId)
                   .stream()
                   .sorted(Comparator.comparing(Exam::getId, Comparator.reverseOrder()))
                   .collect(Collectors.toList());
    }

    /**
     * Obtém um exame por ID.
     */
    @Transactional(readOnly = true)
    public Optional<Exam> getById(Integer id) {
        return repo.findById(id);
    }

    /**
     * Regista um novo exame.
     */
    public Exam registerExam(Integer doctorId, Integer patientId, String name, String observations, String type) {
        Assert.notNull(doctorId, "Id do médico é obrigatório");
        Assert.notNull(patientId, "Id do paciente é obrigatório");
        Assert.hasText(name, "Nome do exame é obrigatório");

        Doctor doctor = doctorService.getById(doctorId)
            .orElseThrow(() -> new IllegalArgumentException("Médico não encontrado com o id: " + doctorId));
        Patient patient = patientService.getById(patientId)
            .orElseThrow(() -> new IllegalArgumentException("Paciente não encontrado com o id: " + patientId));

        Exam exam = new Exam();
        exam.setDoctor(doctor);
        exam.setPatient(patient);
        exam.setName(name);
        exam.setDatePrescribed(LocalDate.now());
        exam.setObservations(observations);
        exam.setType(type);

        return repo.save(exam);
    }

    /**
     * Adiciona o url do resultado do exame.
     */
    public void addFileUrl(Integer id, String url){
        Assert.notNull(url, "File Url é obrigatório");

        Exam d = repo.findById(id)
                     .orElseThrow(() -> new RuntimeException("Exame não encontrado."));
        
        d.setFileUrl(url);
        repo.save(d);
    }

    /**
     * Retorna o url do resultado do exame.
     */
    public String getFileUrl(Integer id) {
        Exam d = repo.findById(id)
                     .orElseThrow(() -> new RuntimeException("Exame não encontrado."));
        return d.getFileUrl();
        
    }

    /**
     * Remove um exame.
     */
    public void deleteExam(Integer id) {
        if (!repo.existsById(id)) {
            throw new IllegalArgumentException("Exame não encontrado com id: " + id);
        }
        repo.deleteById(id);
    }
}
