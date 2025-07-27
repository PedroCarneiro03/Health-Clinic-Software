package com.portalsaude.model;

import jakarta.persistence.*;
import java.util.List;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@DiscriminatorValue("DOCTOR")
@Table(name = "doctor")
@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Doctor extends User {

    @Column(name = "name", length = 150, nullable = false)
    private String name;

    @Column(name = "specialization", length = 150, nullable = false)
    private String specialization;

    @Column(name = "photoUrl", length = 255, nullable = true)
    private String photoUrl;

    @OneToMany(mappedBy = "doctor")
    private List<Patient> patients;

    @OneToMany(mappedBy = "doctor")
    private List<Exam> exams;

    @OneToMany(mappedBy = "doctor")
    private List<Consult> consults;

    @OneToMany(mappedBy = "doctor")
    private List<AvailabilitySlot> availabilitieSlots;
}