package com.portalsaude.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@DiscriminatorValue("PATIENT")
@Table(name = "patient")
@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Patient extends User {

    @Column(name = "name", length = 150, nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn(name = "doctorid", nullable = false)
    @JsonIgnoreProperties({"passHash", "patients", "notifications", "drugs", "exams", "consults", "availabilities"})
    private Doctor doctor;

    @Column(name = "gender", nullable = false)
    private String gender;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "birthdate", nullable = false)
    private LocalDate birthdate;

    @Column(name = "height", nullable = true)
    private Integer height;

    @Column(name = "weight", nullable = true)
    private Integer weight;

    @Column(name = "healthNumber", nullable = true, unique = true)
    private Integer healthNumber;   

    @OneToMany(mappedBy = "patient")
    private List<Exam> exams;

    @OneToMany(mappedBy = "patient")
    private List<Consult> consults;

    @Column(name = "photoUrl", length = 255, nullable = true)
    private String photoUrl;

    @Column(name = "phoneNumber", length = 255, nullable = true)
    private String phoneNumber;

    @Column(name = "nationality", length = 255, nullable = true)
    private String nationality;

    @Column(name = "vaccinesbookurl", length = 255, nullable = true)
    private String vaccinesBookUrl;
}