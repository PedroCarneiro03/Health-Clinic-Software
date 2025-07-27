package com.portalsaude.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.portalsaude.model.Patient;

public interface PatientRepository extends JpaRepository<Patient, Integer> {

    /**
     * listar todos os pacientes de um médico
     * @param doctorid id do medico
     * @return
     */
    List<Patient> findByDoctorId(Integer doctorid);


    Optional<Patient> findByHealthNumber(Integer healthNumber);

    @Query("SELECT p.name FROM Patient p WHERE p.id = :id")
    Optional<String> findNameById(@Param("id") Integer id);

    @Query("SELECT p.photoUrl FROM Patient p WHERE p.id = :id")
    Optional<String> findPhotoUrlById(@Param("id") Integer id);

}
