package com.portalsaude.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.portalsaude.model.Doctor;

public interface DoctorRepository extends JpaRepository<Doctor, Integer> {

    @Query("SELECT p.name FROM Patient p WHERE p.id = :id")
    Optional<String> findNameById(@Param("id") Integer id);
}
