import { useEffect, useState } from "react";
import { PacientBox } from "@/components/pacient-box/pacient-box";
import { Title } from "@/components/title/title";
import { TableRecipts } from "@/components/tabela-receitas/tabela-receitas";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrescriptionPopup } from "@/components/prescription-popup/presciption-popup";
import { API_BASE_URL } from "@/config/api";
import { useParams } from "react-router-dom";

type Pacient = {
  name: string;
  birthdate: string;
  height: number;
  weight: number;
  gender: string;
  photoUrl: string;
  healthNumber:string;
  id:string
};

type medication ={
  id: number,
  medication: string,
  dosage: string,
  frequency: string,
  duration: string
}

type lineType =
{
  id: string,
  date: string,
  doctorName: string,
  medications: medication[],
  patientId? :number, // possivelmente como vai ser uma lista de um único paciente, pode ser ignorado
  doctorId? :number, // possivelmente como vai ser uma lista de um único paciente, pode ser ignorado
  additionalInformation?: string,
}


export function PLanoIndividualReceita() {
  const token = sessionStorage.getItem('authToken');
  const { id } = useParams<{ id: string }>();
  const [pacient, setPacient] = useState<Pacient | null>(null);
  const [isReceitaOpen, setIsReceitaOpen] = useState(false);
  const [prescriptions,setPrescriptions] = useState<lineType[]>([])


  let medico;

  if (sessionStorage.getItem("role") == "DOCTOR") {
    medico=JSON.parse(sessionStorage.getItem("User")||"{}");
  }

  function handleSubmitReceita(data: {
    patientName:string,
    patientHealthNumber:string,
    patitentId:string,
    doctorName:string,
    doctorId:string,
    date: string;
    medications: {
      value: string;
      dosage: string;
      frequency: string;
      duration: string;
    }[],
    adicionalInformation:String
  }) {

    const payload = {
      patientId:data.patitentId,
      doctorId: data.doctorId,
      date: data.date,
      additionalInformation: data.adicionalInformation,
      medications: data.medications.map(med => ({
        medication: med.value,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
      })),
    }
    console.log("Enviar para API:")
    console.log(JSON.stringify(payload))

    const token = sessionStorage.getItem('authToken');
    console.log(`token: ${token}`)
    fetch(`${API_BASE_URL}/api/prescriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' , 'Authorization': `Bearer ${token}`,},
      body: JSON.stringify(payload),
    })
      .then(res => {
        if (!res.ok) {
          // lê o corpo como texto e rejeita a promise com erro
          return res.text().then(text => Promise.reject(new Error(`Status ${res.status}: ${text}`)))
        }
        return res.json()
      })
      .then(result => {
        console.log('Receita enviada com sucesso:', JSON.stringify(result))
        setIsReceitaOpen(false)
        window.location.reload()
      })
      .catch(err => {
        console.error('Erro ao enviar receita:', err)
        // aqui você pode mostrar uma notificação de erro ao usuário
      })


    setIsReceitaOpen(false);
  }

  useEffect(() => {
    // Aqui podes usar `id` para fazer uma requisição, ex:
    // axios.get(`/api/pacientes/${id}`).then(...)
    

    fetch(`${API_BASE_URL}/api/prescriptions/patient/${id}`,
    {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`
      }})
      .then(res => res.json())
      .then((data: lineType[]) => {
        setPrescriptions(data)
      })
    fetch(`${API_BASE_URL}/api/patients/${id}`,
    {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`
      }})
    .then(res => res.json())
    .then((data: Pacient) => {
      setPacient(data)
    })




  }, [id]);


  function isAdmin() {
    return sessionStorage.getItem("role") ==="DOCTOR"
  }

  return (
    pacient !== null ? (
      <div>
      <Title text="Plano Inidividual | Receitas" undoPage={`/plan/${id}`}/>

      <div className="flex w-full mb-10">
        <PacientBox user={pacient} />
      </div>
      {(isAdmin() && medico) ? (
        <div className="flex gap-8">
          {/* Faz o TableRecipts crescer e ocupar todo o espaço restante */}
          <div className="flex-1">
            <TableRecipts lines={prescriptions}/>
          </div>

          {/* Ações à direita */}
          <div className="flex flex-col gap-6 w-40">
            <div onClick={() =>  setIsReceitaOpen(true)} className="flex flex-col items-center">
              <Button className="h-10 w-10 rounded-full bg-[#4361EE] flex items-center justify-center p-0">
                <Plus className="h-5 w-5 text-white" />
              </Button>
              <p className="mt-2 text-[#B5B7C0] text-[14px] text-center">
                Nova receita
              </p>
            </div>

          </div>
          <PrescriptionPopup
            isOpen={isReceitaOpen}
            onClose={() => setIsReceitaOpen(false)}
            onSubmit={handleSubmitReceita}
            patientName={pacient.name}
            patientHealthNumber={pacient.healthNumber}
            patitentId={pacient.id}
            doctorName={medico.name}
            doctorId={medico.id}
          />
        </div>
      ) : (
        <TableRecipts lines={prescriptions}/>
      )}
      
    
      </div>
    ) : (
      <div>Loading</div>
    )
  );
}
