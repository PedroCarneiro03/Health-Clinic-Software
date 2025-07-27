package com.portalsaude.service;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.portalsaude.event.DoctorCreatedEvent;
import com.portalsaude.model.Doctor;
import com.portalsaude.repository.DoctorRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.util.Assert;

import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class DoctorService {
    private final DoctorRepository doctorRepo;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Obtém um médico por ID.
     */
    @Transactional(readOnly = true)
    public Optional<Doctor> getById(Integer id) {
        return doctorRepo.findById(id);
    }

    /**
     * Obtém um médico por ID.
     */
    @Transactional(readOnly = true)
    public Optional<String> getNameById(Integer id) {
        return doctorRepo.findNameById(id);
    }

    /**
     * Regista um novo médico.
     */
    public Doctor registerDoctor(String rawPassword, String name, String specialty) {
        Assert.hasText(rawPassword, "Password é obrigatória");
        Assert.isTrue(rawPassword.length() >= 8, "Password deve ter pelo menos 8 caracteres");
        Assert.hasText(name, "Nome é obrigatório");
        Assert.hasText(specialty, "Especialidade é obrigatória");

        Doctor d = new Doctor();
        d.setName(name);
        d.setSpecialization(specialty);
        d.setPassHash(passwordEncoder.encode(rawPassword) );
        d.setType("DOCTOR");


        Doctor saved = doctorRepo.save(d);

        // Trigger: logo que o médico é criado, dispara o evento
        eventPublisher.publishEvent(new DoctorCreatedEvent(saved.getId()));

        return saved;
    }

    /**
     * Atualiza os dados do médico.
     */
    public Doctor updateDoctor(Integer id, String name, String specialty) {
        Doctor d = doctorRepo.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Médico não encontrado com id: " + id));

        if (name != null) d.setName(name);
        if (specialty != null) d.setSpecialization(specialty);

        return doctorRepo.save(d);
    }

    /**
     * Atualiza o URL da foto do médico.
     */
    public Doctor updatePhoto(Integer id, String photoUrl) {
        Assert.notNull(id, "Url da foto é obrigatório");
        Doctor d = doctorRepo.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Médico não encontrado com id: " + id));

        d.setPhotoUrl(photoUrl);
        return doctorRepo.save(d);
    }

    /**
     * Remove um médico.
     */
    public void deleteDoctor(Integer id) {
        if (!doctorRepo.existsById(id)) {
            throw new IllegalArgumentException("Médico não encontrado com id: " + id);
        }
        doctorRepo.deleteById(id);
    }
}
