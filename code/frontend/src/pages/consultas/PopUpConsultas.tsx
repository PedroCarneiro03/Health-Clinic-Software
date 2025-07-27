import * as React from "react";
import { format, addWeeks, subWeeks, startOfWeek, addDays } from "date-fns";
import { API_BASE_URL } from "@/config/api";

interface PopUpConsultasProps {
  onClose: () => void;
}

type Slot = {
  id: number;
  date: string;
  time: string;
  state: "Livre" | "Bloqueado" | "Reservado";
};

const PopUpConsultas: React.FC<PopUpConsultasProps> = ({ onClose }) => {
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(new Date());
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = React.useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const [slots, setSlots] = React.useState<Slot[]>([]);

  const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  const generateSlots = (weekStart: Date): Slot[] => {
    const initialSlots: Slot[] = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = addDays(weekStart, i);
      for (let hour = 8; hour <= 18; hour++) {
        const time = `${hour.toString().padStart(2, "0")}:00`;
        initialSlots.push({
          id: -1,
          date: format(currentDate, "yyyy-MM-dd"),
          time,
          state: "Bloqueado",
        });
      }
    }
    return initialSlots;
  };

  React.useEffect(() => {
    const fetchAvailability = async () => {
      const doctorId = 1;
      const token = sessionStorage.getItem("authToken");
      if (!doctorId || !token) return;

      const start = format(currentWeekStart, "yyyy-MM-dd");
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/availability/doctors/${doctorId}/week?start=${start}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error(`Erro na resposta: ${response.status}`);
        const data = await response.json();
        const updatedSlots = generateSlots(currentWeekStart).map((slot) => {
          const apiSlot = data.slots.find(
            (s: any) => s.start === `${slot.date}T${slot.time}`
          );
          if (apiSlot) {
            const statusMap: Record<string, "Livre" | "Bloqueado" | "Reservado"> = {
              FREE: "Livre",
              BLOCKED: "Bloqueado",
              BOOKED: "Reservado",
            };
            return {
              ...slot,
              id: apiSlot.id,
              state: statusMap[apiSlot.status] || "Livre",
            };
          }
          return slot;
        });
        setSlots(updatedSlots);
      } catch (error) {
        console.error("Falha ao buscar disponibilidade:", error);
      }
    };
    fetchAvailability();
  }, [currentWeekStart]);

  const requestConsultation = async () => {
    const userId = sessionStorage.getItem("id");
    const token = sessionStorage.getItem("authToken");
    if (!userId || !token || !selectedTime || !selectedDate) return;

    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    const slot = slots.find((s) => s.date === formattedDate && s.time === selectedTime && s.state === "Livre");
    if (!slot) {
      alert("Esse horário já não está livre. Por favor selecione outro.");
      return;
    }

    try {
      const startDate = `${format(selectedDate, "dd/MM/yyyy")} ${selectedTime}`;
      const postRes = await fetch(`${API_BASE_URL}/api/consults`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId: 1,
          patientId: userId,
          startDate,
        }),
      });

      if (!postRes.ok) {
        const errorText = await postRes.text();
        throw new Error(`Falha ao requisitar consulta: ${postRes.status} - ${errorText}`);
      }

      const patchRes = await fetch(
        `${API_BASE_URL}/api/availability/slots/${slot.id}/book/${userId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!patchRes.ok) {
        const errorText = await patchRes.text();
        throw new Error(`Falha ao atualizar slot: ${patchRes.status} - ${errorText}`);
      }

      setSlots((prevSlots) =>
        prevSlots.map((s) =>
          s.date === formattedDate && s.time === selectedTime ? { ...s, state: "Reservado" } : s
        )
      );

      onClose();
      alert("Consulta criada com sucesso!");
    } catch (error) {
      console.error("Erro ao requisitar consulta ou atualizar slot:", error);
      alert("Erro ao criar consulta ou atualizar slot. Tente novamente.");
    }
  };

  const goToPreviousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
    setSelectedDate(null);
    setSelectedTime(null);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 backdrop-filter backdrop-blur-sm" />
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-7xl relative z-10">
        <h2 className="text-2xl font-semibold mb-4">Selecionar Horário para Consulta</h2>

        <div className="grid grid-cols-9 gap-2 mb-4">
          <div className="flex items-center justify-center">
            <button
              onClick={goToPreviousWeek}
              className="text-2xl bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            >
              &lt;
            </button>
          </div>

          {Array.from({ length: 7 }).map((_, index) => {
            const date = addDays(currentWeekStart, index);
            const dayName = diasSemana[date.getDay()];
            return (
              <div key={index} className="text-center">
                <button
                  className={`p-2 border rounded w-full ${
                    selectedDate && format(selectedDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                  onClick={() => setSelectedDate(date)}
                >
                  {dayName}<br />{format(date, "dd/MM")}
                </button>
              </div>
            );
          })}

          <div className="flex items-center justify-center">
            <button
              onClick={goToNextWeek}
              className="text-2xl bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            >
              &gt;
            </button>
          </div>
        </div>

        <div className="grid grid-cols-9 gap-2">
          <div />
          {Array.from({ length: 7 }).map((_, dayIndex) => {
            const date = addDays(currentWeekStart, dayIndex);
            return (
              <div key={dayIndex} className="flex flex-col items-center">
                {Array.from({ length: 11 }).map((_, timeIndex) => {
                  const slotDate = new Date(date);
                  slotDate.setHours(8 + timeIndex, 0, 0, 0);
                  const time = format(slotDate, "HH:00");
                  const slot = slots.find(
                    (s) => s.date === format(slotDate, "yyyy-MM-dd") && s.time === time
                  );

                  const isSelected =
                    selectedTime === time &&
                    selectedDate &&
                    format(selectedDate, "yyyy-MM-dd") === format(slotDate, "yyyy-MM-dd");

                  if (!slot || slot.state !== "Livre") {
                    return (
                      <button
                        key={timeIndex}
                        className="p-2 border rounded w-full mb-1 bg-gray-200 text-gray-500 cursor-not-allowed"
                        disabled
                      >
                        -
                      </button>
                    );
                  }

                  return (
                    <button
                      key={timeIndex}
                      className={`p-2 border rounded w-full mb-1 ${
                        isSelected ? "bg-blue-400 text-white" : "bg-emerald-200 hover:bg-emerald-300"
                      }`}
                      onClick={() => {
                        setSelectedDate(slotDate);
                        setSelectedTime(time);
                      }}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            );
          })}
          <div />
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Cancelar
          </button>
          <button
            onClick={requestConsultation}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={!selectedTime}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopUpConsultas;