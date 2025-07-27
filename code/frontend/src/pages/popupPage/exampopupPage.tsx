import React, { useState } from "react";
import { PrescriptionExamPopup } from "@/components/exame-prescription-popup/exame-prescription-popup";
import { Button } from "@/components/ui/button";

export function PopupExamPage() {
  const [isExamOpen, setIsExamOpen] = useState(false);

  const paciente = {
    id: "98262646",
    name: "José António da Silva Costa",
    health_number: "2349583053",
  };
  const medico = {
    name: "Michael Smith",
    id: "122432445",
  };

  function handleSubmitExams(data: {
    patientName: string;
    patientHealthNumber: string;
    doctorName: string;
    date: string;
    exams: { value: string; description: string }[];
    additionalInformation: string;
  }) {
    // enviar para API
    console.log("Exames submetidos:", data);
    setIsExamOpen(false);
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Gestão de Exames</h1>
      <Button onClick={() => setIsExamOpen(true)}>+ Novo Exame</Button>

      <PrescriptionExamPopup
        isOpen={isExamOpen}
        onClose={() => setIsExamOpen(false)}
        onSubmit={handleSubmitExams}
        patientName={paciente.name}
        patientHealthNumber={paciente.health_number}
        doctorName={medico.name}
        doctorId={medico.id}
      />
    </div>
  );
}
