package com.portalsaude.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import com.portalsaude.exceptions.DuplicateResourceException;
import com.portalsaude.model.Doctor;
import com.portalsaude.model.Patient;
import com.portalsaude.repository.DoctorRepository;
import com.portalsaude.repository.PatientRepository;

import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
@Transactional
@RequiredArgsConstructor
public class PatientService {
    private final PatientRepository patientRepo;
    private final DoctorRepository doctorRepo;
    private final DoctorService doctorService;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;


    /**
     * Lista todos os pacientes de um médico específico.
     */
    @Transactional(readOnly = true)
    public List<Patient> getPatientsByDoctorId(Integer doctorId) {
        Assert.notNull(doctorId, "Id do médico é obrigatório");
        return patientRepo.findByDoctorId(doctorId);
    }

    /**
     * Obtém um paciente com o ID.
     */
    @Transactional(readOnly = true)
    public Optional<Patient> getById(Integer id) {
        return patientRepo.findById(id);
    }

    /**
     * Retorna o nome do paciente ou null se não existir
     */
    public String getPatientNameById(Integer patientId) {
        if (patientId == null) {
            return null;
        }
        Optional<String> nameOpt = patientRepo.findNameById(patientId);
        return nameOpt.orElse(null);
    }

    /**
     * Retorna o nome do paciente ou null se não existir
     */
    public String getPatientPhotoById(Integer patientId) {
        if (patientId == null) {
            return null;
        }
        Optional<String> photoOpt = patientRepo.findPhotoUrlById(patientId);
        return photoOpt.orElse(null);
    }

    /**
     * Regista um novo paciente
     */
    public Patient registerPatient(Integer healthNumber, String email, String rawPassword, String name, LocalDate birthdate, String gender, String phoneNumber, String nationality) {
        Assert.notNull(healthNumber, "Número de saúde é obrigatório");
        Assert.hasText(rawPassword, "Password é obrigatória");
        Assert.hasText(email, "Email é obrigatório");
        Assert.isTrue(rawPassword.length() >= 8, "Password deve ter pelo menos 8 caracteres");
        Assert.hasText(name, "Nome é obrigatório");
        Assert.notNull(birthdate, "Idade é obrigatória");
        Assert.isTrue(!LocalDate.now().isBefore(birthdate), "Idade deve ser positiva");
        Assert.hasText(gender, "Género é obrigatório");
        Assert.hasText(phoneNumber, "Telefone é obrigatório");
        Assert.hasText(nationality, "Nacionalidade é obrigatória");


        if (patientRepo.findByHealthNumber(healthNumber).isPresent()) {
            throw new DuplicateResourceException(
            "HealthNumber já registado: " + healthNumber);
        }

        List<Doctor> allDoctors = doctorRepo.findAll();
        if (allDoctors.isEmpty()) {
            throw new IllegalStateException("Não existem médicos disponíveis para atribuir");
        }
        Doctor randomDoctor = allDoctors.get(new Random().nextInt(allDoctors.size()));

        Patient p = new Patient();
        p.setHealthNumber(healthNumber);
        p.setName(name);
        p.setEmail(email);
        p.setBirthdate(birthdate);
        p.setGender(gender);
        p.setDoctor(randomDoctor);
        p.setNationality(nationality);
        p.setPhoneNumber(phoneNumber);
        p.setPassHash(passwordEncoder.encode(rawPassword) );
        p.setType("PATIENT");

        return patientRepo.save(p);
    }

    /**
     * Atualiza os dados do paciente
     */
    public Patient updatePatient(Integer id, String name, String email, String phoneNumber, Integer height, Integer weight) {
        Patient p = patientRepo.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Paciente não encontrado com id: " + id));

        if (name != null) p.setName(name);
        if (email != null) p.setEmail(email);
        if (phoneNumber != null) p.setPhoneNumber(phoneNumber);
        if (height != null) p.setHeight(height);
        if (weight != null) p.setWeight(weight);

        return patientRepo.save(p);
    }

    public void updatePhoto(Integer id, String imageUrl){
        Patient p = patientRepo.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Paciente não encontrado com o id: " + id));

        p.setPhotoUrl(imageUrl);
        patientRepo.save(p);
    }


    public void updateVaccinesBookUrl(Integer id, String vaccinesBookUrl){
        Patient p = patientRepo.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Paciente não encontrado com o id: " + id));

        p.setVaccinesBookUrl(vaccinesBookUrl);
        patientRepo.save(p);
    }

    /**
     * Associa um novo médico a um paciente mediante o id dos dois.
     */
    public void assignDoctor(Integer patientId, Integer doctorId) {
        Patient p = patientRepo.findById(patientId)
            .orElseThrow(() -> new IllegalArgumentException("Paciente não encontrado com o id: " + patientId));
        Doctor d = doctorService.getById(doctorId)
            .orElseThrow(() -> new IllegalArgumentException("Médico não encontrado." + doctorId));

        p.setDoctor(d);
        patientRepo.save(p);
    }

    /**
     * Remove um paciente.
     */
    public void deletePatient(Integer id) {
        if (!patientRepo.existsById(id)) {
            throw new IllegalArgumentException("Paciente não encontrado com o id: " + id);
        }
        userService.deleteUser(id);
        patientRepo.deleteById(id);
    }
}
