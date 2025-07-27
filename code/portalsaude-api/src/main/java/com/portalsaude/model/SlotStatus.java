package com.portalsaude.model;

public enum SlotStatus {
  BLOCKED,  // 1 — não disponível
  FREE,     // 2 — disponível para marcação
  BOOKED    // 3 — já reservado por um paciente
}