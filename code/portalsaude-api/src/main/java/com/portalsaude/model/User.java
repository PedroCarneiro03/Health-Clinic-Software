package com.portalsaude.model;

import java.util.List;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(
    name = "type", 
    discriminatorType = DiscriminatorType.STRING
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @SequenceGenerator(
      name = "user_seq", 
      sequenceName = "user_seq", 
      allocationSize = 1
    )
    @GeneratedValue(
      strategy = GenerationType.SEQUENCE, 
      generator = "user_seq"
    )
    private Integer id;

    @Column(name = "passHash", length = 255, nullable = false)
    private String passHash;

    @Column(name = "type", insertable = false, updatable = false)
    private String type; // Discriminator value (e.g., "DOCTOR", "PATIENT") used for roles later

    @OneToMany(mappedBy = "user")
    private List<Notification> notifications;
}