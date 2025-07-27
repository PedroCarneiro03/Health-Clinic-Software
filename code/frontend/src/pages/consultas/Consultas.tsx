import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Title } from "@/components/title/title";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import * as React from "react";
import { API_BASE_URL } from "@/config/api";
import PopUpConsultas from "./PopUpConsultas";

// Tipos
type PatientConsultation = {
  id: number;
  type: string;
  date: string;
  time: string;
  medium: string;
  doctorName: string;
  startDateTime: string;
};

type DoctorConsultation = {
  id: number;
  name: string;
  timeRemaining: number;
  duration: string;
  medium: string;
};

const formatTimeRemaining = (minutes: number): string => {
  if (minutes === 0) return "Pronta a iniciar";
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  let result = "";
  if (days > 0) result += `${days}d `;
  if (hours > 0) result += `${hours}h `;
  if (mins > 0) result += `${mins} min`;
  return result.trim();
};

export default function Consultas() {
  const [consultations, setConsultations] = React.useState<PatientConsultation[] | DoctorConsultation[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [error, setError] = React.useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = React.useState(false);
  const itemsPerPage = 8;

  const role = (sessionStorage.getItem("role") || "PATIENT").trim().toUpperCase();

  React.useEffect(() => {
    const fetchConsultations = async () => {
      const userId = sessionStorage.getItem("id");
      const token = sessionStorage.getItem("authToken");

      if (!userId || !token) {
        setError("Falha na autenticação. Faça login novamente.");
        return;
      }

      try {
        let res;
        if (role === "DOCTOR") {
          const doctorId = parseInt(userId, 10);
          res = await fetch(`${API_BASE_URL}/api/consults/doctor/${doctorId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error(`Erro ao carregar consultas: ${res.statusText}`);
          const data = await res.json();
          const transformed: DoctorConsultation[] = data.map((item: any) => ({
            id: item.id,
            name: item.patientName,
            timeRemaining: Math.max(
              Math.floor((new Date(item.startDate).getTime() - new Date().getTime()) / 60000),
              0
            ),
            duration: item.duration ? `${item.duration} min` : "60 min",
            medium: "Online",
          }));
          setConsultations(transformed);
        } else {
          res = await fetch(`${API_BASE_URL}/api/consults/patient/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Erro ao carregar consultas: ${res.status} - ${errorText}`);
          }
          const data = await res.json();
          const transformed: PatientConsultation[] = data.map((item: any) => {
            const startDate = new Date(item.startDate);
            return {
              id: item.id,
              type: item.type || "Rotina",
              date: startDate.toISOString().split("T")[0],
              time: startDate.toISOString().split("T")[1].slice(0, 5),
              medium: item.medium || "Online",
              startDateTime: item.startDate,
              doctorName: item.doctorName || "",
            };
          });
          setConsultations(transformed);
        }
        setError(null);
      } catch (error) {
        setError("Erro ao carregar consultas. Verifique sua conexão ou autenticação.");
      }
    };

    fetchConsultations();
  }, [role]);

  const viewDetails = async (consultId: number) => {
    const token = sessionStorage.getItem("authToken");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/consults/link/${consultId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erro ao obter link da consulta.");
      const data = await res.json();
      window.open(data.link, "_blank");
    } catch (error) {}
  };

  const startConsultation = async (consultId: number) => {
    const token = sessionStorage.getItem("authToken");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/consults/link/${consultId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erro ao obter link da consulta.");
      const data = await res.json();
      window.open(data.link, "_blank");
    } catch (error) {}
  };

  const getConsultationStatus = (startDateTime: string): { text: string; className: string; disabled: boolean } => {
    const now = new Date();
    const consultationDate = new Date(startDateTime);
    const diffMs = consultationDate.getTime() - now.getTime();
    const diffMinutes = Math.max(Math.floor(diffMs / 60000), 0);

    if (diffMinutes > 60) {
      return { text: "Iniciar", className: "bg-gray-400 text-black", disabled: true };
    } else if (diffMinutes <= 60 && diffMinutes > 0) {
      return { text: "Iniciar", className: "bg-green-500 text-white", disabled: false };
    } else {
      return { text: "Terminado", className: "bg-gray-400 text-white", disabled: true };
    }
  };

  const filteredConsultations = consultations
    .filter((c) => {
      if (role === "DOCTOR") {
        const cTyped = c as DoctorConsultation;
        return cTyped.name && typeof cTyped.timeRemaining === "number" && cTyped.timeRemaining > 0;
      } else {
        const cTyped = c as PatientConsultation;
        return cTyped.type && cTyped.date && cTyped.time && cTyped.doctorName;
      }
    })
    .filter((consultation) => {
      if (role === "DOCTOR") {
        const cTyped = consultation as DoctorConsultation;
        return cTyped.name.toLowerCase().includes(searchTerm.toLowerCase());
      } else {
        const cTyped = consultation as PatientConsultation;
        return (
          cTyped.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cTyped.date.includes(searchTerm) ||
          cTyped.time.includes(searchTerm) ||
          cTyped.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    })
    .sort((a, b) => {
      if (role === "DOCTOR") {
        const aTyped = a as DoctorConsultation;
        const bTyped = b as DoctorConsultation;
        return aTyped.timeRemaining - bTyped.timeRemaining;
      } else {
        const aTyped = a as PatientConsultation;
        const bTyped = b as PatientConsultation;
        return new Date(aTyped.startDateTime).getTime() - new Date(bTyped.startDateTime).getTime();
      }
    });

  const totalPages = Math.ceil(filteredConsultations.length / itemsPerPage);
  const paginatedConsultations = filteredConsultations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <main className="p-4 flex-1 pb-20 relative">
      <Title text={role === "DOCTOR" ? "Consultas" : "As suas consultas"} />
      <h2 className="text-lg font-semibold text-gray-600 mb-4">
        {role === "DOCTOR" ? "Todas as Consultas" : "Todas as Consultas"}
      </h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="flex justify-between mb-4 space-x-4 items-center">
        <Input
          placeholder="Pesquisar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64"
        />
        {role === "PATIENT" && (
          <button
            onClick={() => setIsPopupOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Requisitar Consulta
          </button>
        )}
      </div>

      <div className="mt-32">
        <Table>
          <TableHeader>
            <TableRow>
              {role === "DOCTOR" ? (
                <>
                  <TableHead className="w-[250px]">Nome</TableHead>
                  <TableHead className="w-[150px]">Tempo Restante</TableHead>
                  <TableHead className="w-[150px]">Duração</TableHead>
                  <TableHead className="w-[150px]">Meio</TableHead>
                  <TableHead className="w-[100px]">Iniciar</TableHead>
                </>
              ) : (
                <>
                  <TableHead className="w-[150px]">Data</TableHead>
                  <TableHead className="w-[100px]">Hora</TableHead>
                  <TableHead className="w-[100px]">Meio</TableHead>
                  <TableHead className="w-[150px]">Estado</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedConsultations.map((consultation) => {
              if (role === "DOCTOR") {
                const cTyped = consultation as DoctorConsultation;
                const isUnder1Hour = cTyped.timeRemaining <= 60;
                const isUnder24Hours = cTyped.timeRemaining <= 1440;
                const rowClass = isUnder1Hour
                  ? "bg-green-100"
                  : isUnder24Hours
                  ? "bg-yellow-100"
                  : "";

                return (
                  <TableRow key={cTyped.id} className={rowClass}>
                    <TableCell className="font-medium py-4">{cTyped.name}</TableCell>
                    <TableCell className="py-4">
                      {formatTimeRemaining(cTyped.timeRemaining)}
                    </TableCell>
                    <TableCell className="py-4">{cTyped.duration}</TableCell>
                    <TableCell className="py-4">{cTyped.medium}</TableCell>
                    <TableCell className="py-4">
                      {isUnder1Hour && (
                        <button
                          onClick={() => startConsultation(cTyped.id)}
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                          Iniciar
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              } else {
                const cTyped = consultation as PatientConsultation;
                const { text, className, disabled } = getConsultationStatus(cTyped.startDateTime);
                const formattedDate = new Date(cTyped.date).toLocaleDateString("pt-PT", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                });

                return (
                  <TableRow key={cTyped.id}>
                    <TableCell className="py-4">{formattedDate}</TableCell>
                    <TableCell className="py-4">{cTyped.time}</TableCell>
                    <TableCell className="py-4">{cTyped.medium}</TableCell>
                    <TableCell className="py-4">
                      <button
                        onClick={!disabled ? () => viewDetails(cTyped.id) : undefined}
                        className={`px-4 py-2 rounded ${className} ${disabled ? "cursor-not-allowed" : "hover:opacity-90"}`}
                        disabled={disabled}
                      >
                        {text}
                      </button>
                    </TableCell>
                  </TableRow>
                );
              }
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-500">
          Exibindo {paginatedConsultations.length} de {filteredConsultations.length} entradas
        </p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            {totalPages > 4 && (
              <>
                <PaginationItem><span>...</span></PaginationItem>
                <PaginationItem>
                  <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {role === "PATIENT" && isPopupOpen && <PopUpConsultas
  onClose={() => {
    setIsPopupOpen(false);
    window.location.reload();
  }}
/>
}
    </main>
  );
}
