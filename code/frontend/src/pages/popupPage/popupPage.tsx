import React, { useState } from "react";
import { PrescriptionPopup } from "@/components/prescription-popup/prescription-popup";
import { Button } from "@/components/ui/button";

export function PopupPage() {
  const [isReceitaOpen, setIsReceitaOpen] = useState(false);

  const paciente = {
    id:"98262646",
    name: "José António da Silva Costa",
    health_number: "2349583053",
  };
  const medico = {
    name: "Michael Smith",
    id: "122432445",
  };

  // Agora data + lista completa de SelectedMed
  function handleSubmitReceita(data: {
    patientName:string,
    patientHealthNumber:string,
    doctorName:string,
    date: string;
    medications: {
      value: string;
      dosage: string;
      frequency: string;
      duration: string;
    }[],
    adicionalInformation:String
  }) {


    //enviar para API
    console.log(data)



    setIsReceitaOpen(false);
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Gestão de Receitas</h1>
      <Button onClick={() => setIsReceitaOpen(true)}>+ Nova Receita</Button>

      <PrescriptionPopup
        isOpen={isReceitaOpen}
        onClose={() => setIsReceitaOpen(false)}
        onSubmit={handleSubmitReceita}
        patientName={paciente.name}
        patientHealthNumber={paciente.health_number}
        doctorName={medico.name}
        doctorId={medico.id}
      />
    </div>
  );
}
