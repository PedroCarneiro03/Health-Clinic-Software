package com.portalsaude.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "prescription")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Prescription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "doctorid")
    private Doctor doctor;

    @ManyToOne
    @JoinColumn(name = "patientid")
    private Patient patient;

    @Column(name = "date")
    private LocalDate date;

    @Column(name = "additional_information", columnDefinition = "TEXT")
    private String additionalInformation;

//    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
//    private List<PrescriptionMedication> prescriptionMedications;
}


