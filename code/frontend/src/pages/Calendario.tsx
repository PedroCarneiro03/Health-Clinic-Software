import * as React from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Title } from "@/components/title/title";
import WeeklyCalendar from "@/components/calendar/WeeklyCalendar";
import { API_BASE_URL } from "@/config/api";

type Consultation = {
  id: number;
  link: string;
  startDate: string;
  duration: string | null;
  finished: boolean | null;
  doctorId: number;
  patientId: number;
  patientName: string;
};

export default function CalendarioPage() {
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(new Date());
  const [filteredConsultations, setFilteredConsultations] = React.useState<Consultation[]>([]);

  // Buscar consultas do backend para o dia selecionado
  React.useEffect(() => {
    const fetchConsultations = async () => {
      if (!selectedDate) return;

      const id = sessionStorage.getItem("id");
      const token = sessionStorage.getItem("authToken");
      if (!id || !token) {
        console.warn("ID ou token de autenticação não encontrados.");
        setFilteredConsultations([]);
        return;
      }

      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/availability/doctors/${id}/week?start=${formattedDate}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) {
          throw new Error(`Erro na resposta: ${response.status}`);
        }
        const data = await response.json();
        const consultations: Consultation[] = data.slots
          .filter((slot: any) => slot.status === "BOOKED" && slot.start.startsWith(formattedDate))
          .map((slot: any) => ({
            id: slot.consultId,
            link: "",
            startDate: slot.start,
            duration: null,
            finished: null,
            doctorId: parseInt(id),
            patientId: 0,
            patientName: slot.patientName || "Consulta",
          }));
        setFilteredConsultations(consultations);
      } catch (error) {
        console.error("Erro ao buscar consultas:", error);
        setFilteredConsultations([]);
      }
    };
    fetchConsultations();
  }, [selectedDate]);

  return (
    <main className="p-6 flex-1 pb-20">
      <Title text="Calendário"/>

      {/* Instrução */}
      <p className="mt-1 text-gray-600 text-sm">
        Seleciona um slot, ou vários arrastando, no calendário para indicar a tua disponibilidade.
      </p>

      {/* Calendário */}
      <div className="mt-2 px-4 w-full">
        <WeeklyCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      </div>

      {/* Lista de consultas */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">
          Consultas para {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: pt }) : "Nenhuma data selecionada"}
        </h2>
        {filteredConsultations.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Hora</TableHead>
                <TableHead className="w-[250px]">Nome</TableHead>
                <TableHead className="w-[150px]">Tipo</TableHead>
                <TableHead className="w-[150px]">Duração</TableHead>
                <TableHead className="w-[150px]">Meio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConsultations.map((consultation) => (
                <TableRow key={consultation.id}>
                  <TableCell className="py-4">
                    {format(new Date(consultation.startDate), "HH:mm", { locale: pt })}
                  </TableCell>
                  <TableCell className="font-medium py-4">{consultation.patientName}</TableCell>
                  <TableCell className="py-4">Consulta</TableCell>
                  <TableCell className="py-4">{consultation.duration || "Não especificado"}</TableCell>
                  <TableCell className="py-4">Online</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-gray-500">Nenhuma consulta agendada para este dia.</p>
        )}
      </div>
    </main>
  );
}