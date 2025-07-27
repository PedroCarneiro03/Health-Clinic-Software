package com.portalsaude.dto.availabilitySlotDTO;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeeklySlotsDTO {
    List<SlotDTO> slots;
}
