package com.portalsaude.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.portalsaude.model.Exam;

public interface ExamRepository extends JpaRepository<Exam, Integer> {

    /**
     * listar todos os exames de um paciente.
     * @param patientid id do paciente
     * @return
     */
    List<Exam> findByPatientId(Integer patientid);

}
