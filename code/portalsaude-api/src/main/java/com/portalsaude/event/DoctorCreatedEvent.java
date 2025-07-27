package com.portalsaude.event;

public class DoctorCreatedEvent {
    private final Integer doctorId;
    public DoctorCreatedEvent(Integer doctorId) {
        this.doctorId = doctorId;
    }
    public Integer getDoctorId() {
        return doctorId;
    }
}
