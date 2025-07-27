package com.portalsaude.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "prescription_medication")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionMedication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    @Column(name = "medication", length = 255, nullable = false)
    private String medication;

    @Column(name = "dosage", length = 255, nullable = false)
    private String dosage;

    @Column(name = "frequency", length = 255, nullable = false)
    private String frequency;

    @Column(name = "duration", length = 255, nullable = false)
    private String duration;
}