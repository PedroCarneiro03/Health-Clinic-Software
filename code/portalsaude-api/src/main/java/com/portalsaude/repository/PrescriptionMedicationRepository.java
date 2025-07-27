package com.portalsaude.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.portalsaude.model.PrescriptionMedication;



public interface PrescriptionMedicationRepository  extends JpaRepository<PrescriptionMedication, Integer>{
    
    // boolean existsByMedication_Id(Integer medicationId);

    void deleteByPrescription_Id(Integer prescriptionId);

    List<PrescriptionMedication> findByPrescription_Id(Integer prescriptionId);

}



