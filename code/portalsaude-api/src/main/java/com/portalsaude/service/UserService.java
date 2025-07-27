package com.portalsaude.service;

import com.portalsaude.model.Patient;
import com.portalsaude.model.User;
import com.portalsaude.repository.PatientRepository;
import com.portalsaude.repository.UserRepository;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import java.util.Optional;

@Service
@Transactional
public class UserService implements UserDetailsService{
    private final UserRepository repo;
    private final PasswordEncoder passwordEncoder;
    private final PatientRepository patientRepo;

    public UserService(UserRepository repo, PasswordEncoder passwordEncoder, PatientRepository patientRepo) {
        
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
        this.patientRepo = patientRepo;
    }

    public enum UserType {
        DOCTOR, PATIENT
    }

    /**
     * Obtém um utilizador por ID.
     */
    @Transactional(readOnly = true)
    public Optional<User> getById(Integer id) {
        return repo.findById(id);
    }

    /**
     * Altera a password do user, verifica se é diferente da atual.
     * @throws IllegalArgumentException se a nova pass for igual à atual.
     */
    public void changePassword(Integer id, String newRawPassword) {
        Assert.hasText(newRawPassword, "Password é obrigatória");
        Assert.isTrue(newRawPassword.length() >= 8, "Password deve ter pelo menos 8 caracteres");

        User u = repo.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Utilizador não encontrado com id: " + id));
        
        String currentPassword = u.getPassHash();
        if (passwordEncoder.matches(newRawPassword, currentPassword)) {
            throw new IllegalArgumentException("Nova password não pode ser igual à atual");
        }

        u.setPassHash(passwordEncoder.encode(newRawPassword));
        repo.save(u);
    }

    /**
     * Apaga um user por ID.
     */
    public void deleteUser(Integer id) {
        if (!repo.existsById(id)) {
            throw new IllegalArgumentException("Utilizador não encontrado com id: " + id);
        }
        repo.deleteById(id);
    }

    @Override
    public UserDetails loadUserByUsername(String identifier)
        throws UsernameNotFoundException {
        Integer num;
        try {
            num = Integer.valueOf(identifier);
        } catch (NumberFormatException e) {
            throw new UsernameNotFoundException("Identificador inválido");
        }

        Optional<Patient> optPatient = patientRepo.findByHealthNumber(num);
        User u = optPatient
            // Se não for paciente, procura no UserRepository (trará o doctor)
            .<User>map(p -> p)
            .orElseGet(() ->
               repo.findById(num)
                   .orElseThrow(() ->
                      new UsernameNotFoundException("Utilizador não encontrado: " + identifier))
            );

        return toUserDetails(u);
    }

    private UserDetails toUserDetails(User user) {
        String role = "ROLE_" + user.getType().toUpperCase();
        return org.springframework.security.core.userdetails.User
            .withUsername(user.getId().toString())
            .password(user.getPassHash())
            .authorities(role)
            .build();
    }
}