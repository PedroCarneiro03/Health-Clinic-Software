package com.portalsaude.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "consult")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Consult {
    @Id
    @SequenceGenerator(
      name = "consult_seq", 
      sequenceName = "consult_seq", 
      allocationSize = 1
    )
    @GeneratedValue(
      strategy = GenerationType.SEQUENCE, 
      generator = "consult_seq"
    )
    private Integer id;

    @Column(name = "link", length = 255)
    private String link;

    @Column(name = "startdate")
    private LocalDateTime startDate;

    @Column(name = "duration")
    private Integer duration;

    @Column(name = "finished")
    private Boolean finished;

    @Column(name = "type")
    private Boolean tipo;

    @ManyToOne
    @JoinColumn(name = "doctorid")
    private Doctor doctor;

    @ManyToOne
    @JoinColumn(name = "patientid")
    private Patient patient;
}