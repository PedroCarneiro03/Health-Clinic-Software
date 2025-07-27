import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PacientBox } from "@/components/pacient-box/pacient-box";
import { Title } from "@/components/title/title";
import { TableExams } from "@/components/tabela-exames/tabela-exames";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExamResultUploadModal } from '@/components/exam-result-upload-popup/exam-result-upload-popup';
import { PrescriptionExamPopup } from "@/components/exame-presciption-popup/exame-prescription-popup";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { API_BASE_URL } from "@/config/api";

type Pacient = {
  name: string;
  birthdate: string;
  height: number;
  weight: number;
  gender: string;
  photoUrl: string;
  healthNumber: string;
  id: string
};

type lineType =
  {
    id: string,
    name: string,
    datePrescribed: string,
    doctorName: string,
    patientId?: number, // possivelmente como vai ser uma lista de um único paciente, pode ser ignorado
    observations?: string,
    fileUrl: string,
    type?: string,
  }


export function PLanoIndividualExame() {
  const token = sessionStorage.getItem('authToken');
  //const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [pacient, setPacient] = useState<Pacient | null>(null);
  const [isExamOpen, setIsExamOpen] = useState(false);
  const [isUploadExamOpen, setUploadOpen] = useState(false);
  const [exams, setExams] = useState<lineType[]>([])
  const [filter, setFilter] = useState<string>("")
  const [types, setTypes] = useState<{ value: string, label: string }[]>([{ value: "", label: "Todos" }])
  const [uploadId, setUploadId] = useState("")

  let medico;

  if (sessionStorage.getItem("role") == "DOCTOR") {
    medico=JSON.parse(sessionStorage.getItem("User")||"{}");
  }


  useEffect(() => {

    fetch(`${API_BASE_URL}/api/exams/patient/${id}`,
      {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then((data: lineType[]) => {
        setExams(data)
      })
      .catch(err => console.log(err))
    fetch(`${API_BASE_URL}/api/patients/${id}`,
      {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then((data: Pacient) => {
        setPacient(data)
      })
      .catch(err => console.log(err))

    setTypes([
      { value: "", label: "Todos" },
      { value: "radiologia", label: "Radiologia" },
      { value: "imunohematologia", label: "Imunohematologia" },

      { value: "microbiologia", label: "Microbiologia" },
      { value: "imunologia", label: "Imunologia" },
      { value: "cardiologia", label: "Cardiologia" },
      { value: "hematologia", label: "Hematologia" },
      { value: "genetica", label: "Genética" },
    ])

  }, [id]);


  function openPopUpUpload(idUpload: string) {
    setUploadId(idUpload)
    setIsExamOpen(false); setUploadOpen(true)

  }

  function openPopUpPrescription() {
    setIsExamOpen(true); setUploadOpen(false);

  }


  const handleUpload = (data: {
    uploaderName: string;
    uploaderId: string;
    datePrescribed: string;
    id: string;
    file: File;
  }) => {
    // só precisamos do file no FormData
    const formData = new FormData();
    formData.append("file", data.file);

    // endpoint com o ID
    fetch(`${API_BASE_URL}/api/exams/${data.id}/file`, {
      method: "PATCH",
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,

    })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Status ${res.status}: ${text}`);
        }
        // Se for 204 ou não for JSON, não tenta parsear
        const ct = res.headers.get("content-type") || "";
        if (res.status === 204 || !ct.includes("application/json")) {
          return null;
        }
        return res.json();
      })
      .then(result => {
        if (result) {
          console.log("Upload bem-sucedido (com JSON):", result);
        } else {
          console.log("Upload bem-sucedido (sem JSON).");
        }
        window.location.reload()
      })
      .catch((err) => {
        console.error("Erro no upload do ficheiro:", err);
        // aqui podes mostrar uma notificação de erro ao utilizador
      });
    setUploadOpen(false);
  };

  function handleSubmitExams(data: {
    patientName: string;
    patientHealthNumber: string;
    patientId: string,
    doctorName: string;
    doctorId: string,
    datePrescribed: string;
    exams: { value: string; observacoes: string, type: string }[]
  }) {
    // enviar para API
    const examsPayload = data.exams.map((ex) => ({
      patientId: data.patientId,
      doctorId: data.doctorId,
      datePrescribed: data.datePrescribed,
      name: ex.value,
      type: ex.type,
      observations: ex.observacoes,
    }));

    console.log("enviar para API:")
    console.log(JSON.stringify(examsPayload))

    fetch(`${API_BASE_URL}/api/exams`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ exams: examsPayload }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((text) =>
            Promise.reject(new Error(`Status ${res.status}: ${text}`))
          );
        }
        return res.json();
      })
      .then((result) => {
        console.log("Exames enviados com sucesso:", result);
        setIsExamOpen(false);
        window.location.reload()
      })
      .catch((err) => {
        console.error("Erro ao enviar exames:", err);
        // aqui você pode exibir uma notificação de erro ao usuário
      });

    setIsExamOpen(false);
  }

  function isAdmin() {
    console.log(sessionStorage.getItem("role"))
    return sessionStorage.getItem("role") ==="DOCTOR"
  }

  return (
    pacient !== null ? (
      <div>

        <Title text="Plano Inidividual | Exames" undoPage={`/plan/${id}`} />
        <div className="flex w-full mb-10">
          <PacientBox user={pacient} />
        </div>
        {isAdmin() && medico ? (
          <>
            <div className="flex gap-8">
              {/* Faz o TableExams crescer e ocupar todo o espaço restante */}
              <div className="flex-1">
                <Tabs onValueChange={(value: string) => setFilter(value)} defaultValue="todos" className="w-full rounded-xl p-2 bg-[#EFF6FF]">
                  <TabsList className="bg-inherit text-[#62657D] flex justify-between gap-4 px-2">
                    {types.map(({ value, label }) => (
                      <TabsTrigger
                        key={value}
                        value={value}
                        className="text-[#62657D] font-medium px-3 pb-2 border-0 border-b-1 border-transparent data-[state=active]:text-[#2D68FE] data-[state=active]:border-[#2D68FE] transition-all"
                      >
                        {label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                <TableExams onUpload={openPopUpUpload} lines={exams} filterType={filter} />
              </div>

              {/* Ações à direita */}
              <div className="flex flex-col gap-6 w-40">
                <div className="flex flex-col items-center">
                  <Button onClick={openPopUpPrescription} className="h-10 w-10 rounded-full bg-[#4361EE] flex items-center justify-center p-0">
                    <Plus className="h-5 w-5 text-white" />
                  </Button>
                  <p className="mt-2 text-[#B5B7C0] text-[14px] text-center">
                    Nova prescrição
                  </p>
                </div>
              </div>
            </div>

            <PrescriptionExamPopup
              isOpen={isExamOpen}
              onClose={() => { setIsExamOpen(false); setUploadOpen(false) }}
              onSubmit={handleSubmitExams}
              patientName={pacient.name}
              patientHealthNumber={pacient.healthNumber}
              patientId={pacient.id}
              doctorName={medico.name}
              doctorId={medico.id}
            />
            <ExamResultUploadModal
              isOpen={isUploadExamOpen}
              onClose={() => { setUploadOpen(false); setIsExamOpen(false) }}
              uploaderName={medico.name}
              uploaderId={medico.id}
              id={uploadId}
              onSubmit={handleUpload}
            />
          </>

        ) : (
          <div className="flex-1">
                <Tabs onValueChange={(value: string) => setFilter(value)} defaultValue="todos" className="w-full rounded-xl p-2 bg-[#EFF6FF]">
                  <TabsList className="bg-inherit text-[#62657D] flex justify-between gap-4 px-2">
                    {types.map(({ value, label }) => (
                      <TabsTrigger
                        key={value}
                        value={value}
                        className="cursor-pointer text-[#62657D] font-medium px-3 pb-2 border-0 border-b-1 border-transparent data-[state=active]:text-[#2D68FE] data-[state=active]:border-[#2D68FE] transition-all"
                      >
                        {label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                <TableExams onUpload={openPopUpUpload} lines={exams} filterType={filter} />
              </div>
        )}


      </div>
    ) : (
      <div>Loading</div>
    )
  );
}
