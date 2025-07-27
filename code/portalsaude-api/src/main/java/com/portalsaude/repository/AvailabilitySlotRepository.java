// src/main/java/com/portalsaude/repository/AvailabilitySlotRepository.java
package com.portalsaude.repository;

import com.portalsaude.model.AvailabilitySlot;
import com.portalsaude.model.SlotStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Repositório para operações CRUD e queries específicas sobre AvailabilitySlot.
 */
public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot, Integer> {

    /**
     * Retorna as datas (LocalDate) distintas para as quais já existem slots
     * criados para um dado médico no intervalo especificado.
     */
    @Query("SELECT DISTINCT DATE(s.start) " +
           "FROM AvailabilitySlot s " +
           "WHERE s.doctor.id = :docId " +
           "AND s.start BETWEEN :start AND :end")
    List<LocalDate> findDistinctStartDatesByDoctorIdBetween(
        @Param("docId")   Integer doctorId,
        @Param("start")   LocalDateTime start,
        @Param("end")     LocalDateTime end
    );

    /**
     * Busca todos os slots de um médico com um estado específico dentro de um intervalo.
     */
    List<AvailabilitySlot> findByDoctorIdAndStatusAndStartBetween(
        Integer doctorId,
        SlotStatus status,
        LocalDateTime from,
        LocalDateTime to
    );

    /**
     * Busca todos os slots de um médico (qualquer estado) dentro de um intervalo.
     * Útil para listar uma semana inteira de disponibilidades.
     */
    List<AvailabilitySlot> findByDoctorIdAndStartBetween(
        Integer doctorId,
        LocalDateTime from,
        LocalDateTime to
    );
}
