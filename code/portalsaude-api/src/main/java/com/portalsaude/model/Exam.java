package com.portalsaude.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "exam")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Exam {
    @Id
    @SequenceGenerator(
      name = "exam_seq", 
      sequenceName = "exam_seq", 
      allocationSize = 1
    )
    @GeneratedValue(
      strategy = GenerationType.SEQUENCE, 
      generator = "exam_seq"
    )
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "patientid")
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "doctorid")
    private Doctor doctor;

    @Column(name = "name", length = 255, nullable = true)
    private String name;

    @Column(name = "datePrescribed")
    private LocalDate datePrescribed;

    @Column(name = "fileUrl", length = 255, nullable = true)
    private String fileUrl;

    @Column(name = "observations", length = 500, nullable = true)
    private String observations;

    @Column(name = "type", length = 50, nullable = true)
    private String type;
}