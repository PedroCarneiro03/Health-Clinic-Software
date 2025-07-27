package com.portalsaude.dto.availabilitySlotDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SlotDTO {
  public Integer id;
  public String start;     // ISO: “2025-06-15T09:00”
  public String endDate;   // ISO
  public String status;    // “FREE” / “BLOCKED” / “BOOKED”
  public Integer consultId;
  public String patientName;
}
