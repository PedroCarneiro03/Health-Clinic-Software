  package com.portalsaude.model;

  import jakarta.persistence.*;
  import java.time.LocalDateTime;

  import lombok.Data;
  import lombok.NoArgsConstructor;
  import lombok.AllArgsConstructor;

  @Entity
  @Table(name = "availabilitySlot")
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public class AvailabilitySlot {
      @Id
      @SequenceGenerator(
        name = "availabilitySlot_seq", 
        sequenceName = "availabilitySlot_seq", 
        allocationSize = 1
      )
      @GeneratedValue(
        strategy = GenerationType.SEQUENCE, 
        generator = "availabilitySlot_seq"
      )
      private Integer id;

      @ManyToOne
      @JoinColumn(name = "doctorid")
      private Doctor doctor;

      @Column(name = "status")
      private SlotStatus status; // 1 bloqueado, 2 livre, 3 consulta

      @Column(name = "start")
      private LocalDateTime start;

      @Column(name = "endDate")
      private LocalDateTime endDate;

      @Column(name = "consultId")
      private Integer consultId; // id da consulta associada caso exista, pode ser nulo
}
