package com.portalsaude.repository;

import java.util.List;
import java.time.LocalDate;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.portalsaude.model.Consult;


public interface ConsultRepository extends JpaRepository<Consult, Integer> {

    /**
     * listar todas as consultas de um paciente.
     * @param patientid id do paciente
     * @return
     */
    List<Consult> findByPatientId(Integer patientid);

    /**
     * listar todas as consultas de um médico.
     * @param doctorid id do médico
     * @return
     */
    List<Consult> findByDoctorId(Integer doctorid);

    /**
     * Busca consultas que começam em 15 minutos a partir de uma data e hora específicas.
     * @param date Data da consulta
     * @param hour Hora da consulta
     * @param minute Minuto da consulta
     * @return Lista de consultas que começam em 15 minutos
     */
    @Query("SELECT c FROM Consult c WHERE FUNCTION('DATE', c.startDate) = :date " +
       "AND HOUR(c.startDate) = :hour " +
       "AND MINUTE(c.startDate) = :minute")
    List<Consult> findByStartDateHourIn15min(
        @Param("date") LocalDate date, 
        @Param("hour") int hour, 
        @Param("minute") int minute
    );

}
