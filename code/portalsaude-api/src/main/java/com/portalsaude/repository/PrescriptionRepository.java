package com.portalsaude.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.portalsaude.model.Prescription;

public interface PrescriptionRepository extends JpaRepository<Prescription, Integer> {

    /**
     * Lista todas as receitas de um paciente.
     * @param patientId id do paciente
     * @return lista de receitas
     */
    List<Prescription> findByPatientId(Integer patientId);
    
    
}

