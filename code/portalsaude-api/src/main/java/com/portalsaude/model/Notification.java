package com.portalsaude.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "notification")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    @SequenceGenerator(
      name = "notification_seq", 
      sequenceName = "notification_seq", 
      allocationSize = 1
    )
    @GeneratedValue(
      strategy = GenerationType.SEQUENCE, 
      generator = "notification_seq"
    )
    private Integer id;

    @Column(name = "type")
    private Integer type;

    @Column(name = "title", length = 50)
    private String title;

    @Column(name = "description", length = 255, nullable = true)
    private String description;

    @Column(name = "date")
    private LocalDateTime dateTime;

    @Column(name = "seen")
    private Boolean seen;

    @ManyToOne
    
    @JoinColumn(name = "userid")
    private User user;
}