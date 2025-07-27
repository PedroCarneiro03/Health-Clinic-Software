import * as React from "react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { pt } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "@/config/api";
import { Video } from "lucide-react";

type SlotState = "Livre" | "Bloqueado" | "Reservado";

type Schedule = {
  [key: string]: {
    state: SlotState;
    patientName?: string | null;
    consultId?: number | null;
  };
};

type SelectedSlot = { day: Date; hour: number };

type ConsultDetails = {
  id: number;
  link: string;
  startDate: string;
  duration: string | null;
  finished: boolean | null;
  doctorId: number;
  patientId: number;
  patientName: string;
};

const WeeklyCalendar: React.FC<{
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}> = ({ selectedDate, onSelectDate }) => {
  const [currentWeekStart, setCurrentWeekStart] = React.useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [schedule, setSchedule] = React.useState<Schedule>({});
  const [slotIdMap, setSlotIdMap] = React.useState<Record<string, number>>({});
  const [openDialog, setOpenDialog] = React.useState<SelectedSlot[] | null>(null);
  const [selectedState, setSelectedState] = React.useState<SlotState | null>(null);
  const [selectedSlots, setSelectedSlots] = React.useState<SelectedSlot[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [selectedDay, setSelectedDay] = React.useState<Date>(new Date());
  const [consultDialog, setConsultDialog] = React.useState<SelectedSlot | null>(null);
  const [consultDetails, setConsultDetails] = React.useState<ConsultDetails | null>(null);
  const hours = Array.from({ length: 10 }, (_, i) => 8 + i); // 8h às 18h

  // Função auxiliar para gerar chave no formato yyyy-MM-ddTHH:00
  const getFullKey = (day: Date, hour: number) => {
    const dateKey = format(day, "yyyy-MM-dd");
    const timeKey = `${hour.toString().padStart(2, "0")}:00`;
    return `${dateKey}T${timeKey}`;
  };

  // Inicializa o schedule com todos os slots como Bloqueado
  React.useEffect(() => {
    const initialSchedule: Schedule = {};
    hours.forEach((hour) => {
      Array.from({ length: 7 }, (_, i) => {
        const day = addDays(currentWeekStart, i);
        const fullKey = getFullKey(day, hour);
        initialSchedule[fullKey] = { state: "Bloqueado" };
      });
    });
    setSchedule(initialSchedule);
  }, [currentWeekStart]);

  // Fetch disponibilidade e mapeia ids
  React.useEffect(() => {
    const fetchAvailability = async () => {
      const id = sessionStorage.getItem("id");
      const token = sessionStorage.getItem("authToken");
      if (!id || !token) {
        console.warn("ID ou token de autenticação não encontrados.");
        return;
      }
      const start = format(currentWeekStart, "yyyy-MM-dd");
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/availability/doctors/${id}/week?start=${start}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) {
          throw new Error(`Erro na resposta: ${response.status}`);
        }
        const data = await response.json();
        const updatedSchedule: Schedule = { ...schedule };
        const newMap: Record<string, number> = {};
        data.slots.forEach((slot: any) => {
          const statusMap: Record<string, SlotState> = {
            FREE: "Livre",
            BLOCKED: "Bloqueado",
            BOOKED: "Reservado",
          };
          const slotKey = slot.start;
          console.log(`Slot recebido: ${slotKey} -> ${slot.status} (ID: ${slot.id})`);
          updatedSchedule[slotKey] = {
            state: statusMap[slot.status] || "Livre",
            patientName: slot.status === "BOOKED" ? slot.patientName : null,
            consultId: slot.status === "BOOKED" ? slot.consultId : null,
          };
          newMap[slotKey] = slot.id;
        });
        setSchedule(updatedSchedule);
        setSlotIdMap(newMap);
      } catch (error) {
        console.error("Falha ao buscar disponibilidade:", error);
      }
    };
    fetchAvailability();
  }, [currentWeekStart]);

  // Fetch detalhes da consulta para slot Reservado
  React.useEffect(() => {
    const fetchConsultDetails = async () => {
      if (!consultDialog) return;
      const fullKey = getFullKey(consultDialog.day, consultDialog.hour);
      const consultId = schedule[fullKey]?.consultId;
      const token = sessionStorage.getItem("authToken");
      if (!consultId || !token) {
        console.warn("ConsultId ou token não encontrados.");
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/api/consults/${consultId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error(`Erro ao buscar consulta: ${response.status}`);
        }
        const data = await response.json();
        setConsultDetails(data);
      } catch (error) {
        console.error("Erro ao buscar detalhes da consulta:", error);
      }
    };
    fetchConsultDetails();
  }, [consultDialog]);

  // Navegar para a semana anterior
  const goToPreviousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };

  // Navegar para a próxima semana
  const goToNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  // Iniciar arrastar
  const handleMouseDown = (day: Date, hour: number) => {
    const slotState = getSlotState(day, hour);
    if (slotState !== "Reservado") {
      setIsDragging(true);
      setSelectedSlots([{ day, hour }]);
      onSelectDate(new Date(format(day, "yyyy-MM-dd")));
    }
  };

  // Adicionar slots durante o arrastar
  const handleMouseEnter = (day: Date, hour: number) => {
    if (isDragging) {
      const slotState = getSlotState(day, hour);
      if (slotState !== "Reservado") {
        setSelectedSlots((prev) => {
          const exists = prev.some(
            (slot) => slot.day.getTime() === day.getTime() && slot.hour === hour
          );
          if (!exists) {
            return [...prev, { day, hour }];
          }
          return prev;
        });
      }
    }
  };

  // Finalizar arrastar e abrir popup
  const handleMouseUp = () => {
    if (isDragging && selectedSlots.length > 0) {
      setIsDragging(false);
      setOpenDialog(selectedSlots);
      setSelectedState(getSlotState(selectedSlots[0].day, selectedSlots[0].hour));
    }
  };

  // Obter o estado de um slot
  const getSlotState = (day: Date, hour: number): SlotState => {
    const fullKey = getFullKey(day, hour);
    return schedule[fullKey]?.state || "Livre";
  };

  // Enviar PATCH para o backend e atualizar com novo GET
  const handleConfirm = async () => {
    if (selectedState && openDialog) {
      const action = selectedState === "Livre" ? "free" : "block";
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        console.warn("Token de autenticação não encontrado.");
        setOpenDialog(null);
        setSelectedState(null);
        setSelectedSlots([]);
        return;
      }

      const requests = openDialog.map(({ day, hour }) => {
        const fullKey = getFullKey(day, hour);
        const slotId = slotIdMap[fullKey];
        if (slotId) {
          console.log(`Enviando PATCH para slot: ${fullKey} (ID: ${slotId}, Ação: ${action})`);
          return fetch(`${API_BASE_URL}/api/availability/slots/${slotId}/${action}`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
          }).then((response) => {
            if (!response.ok) {
              throw new Error(`Erro ao atualizar slot ${fullKey}: ${response.status}`);
            }
            return response;
          });
        }
        return Promise.resolve(null);
      });

      try {
        await Promise.all(requests);
        setSchedule((prev) => {
          const updatedSchedule = { ...prev };
          openDialog.forEach(({ day, hour }) => {
            const fullKey = getFullKey(day, hour);
            updatedSchedule[fullKey] = { state: selectedState };
          });
          return updatedSchedule;
        });

        // Fazer novo GET para atualizar a semana
        const id = sessionStorage.getItem("id");
        if (id) {
          const start = format(currentWeekStart, "yyyy-MM-dd");
          const response = await fetch(
            `${API_BASE_URL}/api/availability/doctors/${id}/week?start=${start}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (response.ok) {
            const data = await response.json();
            const updatedSchedule: Schedule = { ...schedule };
            const newMap: Record<string, number> = {};
            data.slots.forEach((slot: any) => {
              const statusMap: Record<string, SlotState> = {
                FREE: "Livre",
                BLOCKED: "Bloqueado",
                BOOKED: "Reservado",
              };
              const slotKey = slot.start;
              console.log(`Slot atualizado: ${slotKey} -> ${slot.status} (ID: ${slot.id})`);
              updatedSchedule[slotKey] = {
                state: statusMap[slot.status] || "Livre",
                patientName: slot.status === "BOOKED" ? slot.patientName : null,
                consultId: slot.status === "BOOKED" ? slot.consultId : null,
              };
              newMap[slotKey] = slot.id;
            });
            setSchedule(updatedSchedule);
            setSlotIdMap(newMap);
          } else {
            console.error(`Erro ao atualizar semana: ${response.status}`);
          }
        }
      } catch (error) {
        console.error("Erro ao atualizar slots no backend:", error);
      }
    }
    setOpenDialog(null);
    setSelectedState(null);
    setSelectedSlots([]);
  };

  // Lidar com clique em slot Reservado
  const handleSlotClick = (day: Date, hour: number) => {
    const slotState = getSlotState(day, hour);
    if (slotState === "Reservado") {
      setConsultDialog({ day, hour });
      onSelectDate(new Date(format(day, "yyyy-MM-dd")));
    } else {
      handleMouseDown(day, hour);
    }
  };

  // Cores para cada estado
  const getSlotColor = (state: SlotState) => {
    switch (state) {
      case "Livre":
        return "bg-emerald-50 hover:bg-emerald-100";
      case "Bloqueado":
        return "bg-rose-50 hover:bg-rose-100";
      case "Reservado":
        return "bg-blue-100 hover:bg-blue-200";
      default:
        return "bg-gray-50";
    }
  };

  // Verificar se o slot está selecionado
  const isSlotSelected = (day: Date, hour: number) => {
    return selectedSlots.some(
      (slot) => slot.day.getTime() === day.getTime() && slot.hour === hour
    );
  };

  // Selecionar um dia
  const handleDaySelect = (day: Date) => {
    setSelectedDay(day);
    onSelectDate(new Date(format(day, "yyyy-MM-dd")));
  };

  return (
    <div
      className="w-full p-6 bg-white rounded-lg shadow-sm select-none"
      onMouseUp={handleMouseUp}
    >
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="outline"
          className="text-gray-700 border-gray-300 hover:bg-gray-100"
          onClick={goToPreviousWeek}
        >
          {"<"}
        </Button>
        <h3 className="text-xl font-semibold text-gray-800">
          {format(currentWeekStart, "MMMM yyyy", { locale: pt })}
        </h3>
        <Button
          variant="outline"
          className="text-gray-700 border-gray-300 hover:bg-gray-100"
          onClick={goToNextWeek}
        >
          {">"}
        </Button>
      </div>
      <div className="grid grid-cols-8 gap-2 relative">
        <div className="font-semibold text-gray-600 text-center py-3 select-none">
          Hora
        </div>
        {Array.from({ length: 7 }, (_, i) => {
          const day = addDays(currentWeekStart, i);
          const isCurrentDay = isSameDay(day, new Date());
          const isSelected = isSameDay(day, selectedDay);
          return (
            <div
              key={i}
              className={`font-semibold text-gray-600 text-center py-3 select-none cursor-pointer hover:bg-gray-100 rounded-md transition-colors ${
                isCurrentDay ? "font-bold" : ""
              } ${isSelected ? "border-t-2 border-l-2 border-r-2 border-black rounded-t-md" : ""}`}
              onClick={() => handleDaySelect(day)}
            >
              {format(day, "EEEE dd", { locale: pt })}
            </div>
          );
        })}
        {hours.map((hour) => (
          <React.Fragment key={hour}>
            <div className="font-medium text-gray-600 text-center py-4 bg-gray-50 rounded-md flex items-center justify-center h-16 select-none">
              {`${hour.toString().padStart(2, "0")}:00`}
            </div>
            {Array.from({ length: 7 }, (_, i) => {
              const day = addDays(currentWeekStart, i);
              const slotState = getSlotState(day, hour);
              const isSelected = isSlotSelected(day, hour);
              const isDaySelected = isSameDay(day, selectedDay);
              const slotData = schedule[getFullKey(day, hour)];
              const patientName = slotData?.patientName;
              return (
                <div
                  key={`${i}-${hour}`}
                  className={`h-16 border rounded-md cursor-pointer flex flex-col items-center justify-center ${getSlotColor(
                    slotState
                  )} transition-colors shadow-sm ${
                    isSelected ? "border-blue-500 border-2" : ""
                  } ${
                    isDaySelected
                      ? hour === 17
                        ? "border-b-2 border-l-2 border-r-2 border-black rounded-b-md"
                        : "border-l-2 border-r-2 border-black"
                      : ""
                  }`}
                  onMouseDown={() => handleSlotClick(day, hour)}
                  onMouseEnter={() => handleMouseEnter(day, hour)}
                >
                  {slotState === "Reservado" ? (
                    <>
                      <span className="text-sm font-medium text-gray-700 truncate max-w-full">
                        {patientName || "Consulta"}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <Video size={12} />
                        <span>Online</span>
                      </div>
                    </>
                  ) : (
                    <span className="text-sm font-medium text-gray-700">
                      {slotState}
                    </span>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Popup para slots Livre/Bloqueado */}
      {openDialog && (
        <Dialog open={!!openDialog} onOpenChange={() => setOpenDialog(null)}>
          <DialogContent className="max-w-xs rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold text-gray-800">
                {openDialog.length === 1
                  ? `${format(openDialog[0].day, "dd/MM/yyyy", {
                      locale: pt,
                    })} às ${openDialog[0].hour}:00`
                  : `${openDialog.length} slots selecionados`}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3 py-2">
              <Button
                variant="outline"
                className={`w-full text-gray-700 ${
                  selectedState === "Livre"
                    ? "border-emerald-500 border-2 bg-emerald-50"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => setSelectedState("Livre")}
              >
                Livre
              </Button>
              <Button
                variant="outline"
                className={`w-full text-gray-700 ${
                  selectedState === "Bloqueado"
                    ? "border-rose-500 border-2 bg-rose-50"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => setSelectedState("Bloqueado")}
              >
                Bloqueado
              </Button>
            </div>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
                onClick={() => {
                  setOpenDialog(null);
                  setSelectedSlots([]);
                }}
              >
                Cancelar
              </Button>
              <Button
                className="bg-gray-800 hover:bg-gray-900 text-white"
                onClick={handleConfirm}
              >
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Popup para slots Reservado */}
      {consultDialog && (
        <Dialog open={!!consultDialog} onOpenChange={() => {
          setConsultDialog(null);
          setConsultDetails(null);
        }}>
          <DialogContent className="max-w-sm rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold text-gray-800">
                Detalhes da Consulta
              </DialogTitle>
            </DialogHeader>
            {consultDetails ? (
              <div className="flex flex-col gap-4 py-2">
                <div>
                  <p className="text-sm font-medium text-gray-600">Paciente</p>
                  <Link
                    to={`/plan/${consultDetails.patientId}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {consultDetails.patientName}
                  </Link>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Data e Hora</p>
                  <p className="text-sm text-gray-800">
                    {format(new Date(consultDetails.startDate), "dd/MM/yyyy HH:mm", { locale: pt })}
                  </p>
                </div>
                {consultDetails.duration && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Duração</p>
                    <p className="text-sm text-gray-800">{consultDetails.duration}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-600">Link da Consulta</p>
                  <a
                    href={consultDetails.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Acessar consulta
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600">Carregando detalhes...</p>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default WeeklyCalendar;