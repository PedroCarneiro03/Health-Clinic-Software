import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

function capitalizeFirstLetter(str: string): string {
  return str.length > 0 ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

// Definição de exame
type Exam = {
  value: string;
  type: string;
};

// Lista de exames
const allExams: Exam[] = [
  // Radiologia
  { value: "radiografia torácica", type: "radiologia" },
  { value: "tomografia computadorizada (TC)", type: "radiologia" },
  { value: "ressonância magnética", type: "radiologia" },

  // Imunohematologia
  { value: "teste de antiglobulina (Coombs)", type: "imunohematologia" },
  { value: "tipagem sanguínea e Rh", type: "imunohematologia" },

  // Microbiologia
  { value: "cultura de urina", type: "microbiologia" },
  { value: "cultura de escarro", type: "microbiologia" },
  { value: "teste de sensibilidade a antibióticos", type: "microbiologia" },

  // Imunologia
  { value: "teste ELISA para HIV", type: "imunologia" },
  { value: "dosagem de anticorpos antinucleares (FAN)", type: "imunologia" },

  // Cardiologia
  { value: "ecocardiograma", type: "cardiologia" },
  { value: "eletrocardiograma (ECG)", type: "cardiologia" },
  { value: "teste de esforço", type: "cardiologia" },

  // Hematologia
  { value: "hemograma completo", type: "hematologia" },
  { value: "contagem de plaquetas", type: "hematologia" },

  // Genética
  { value: "cariótipo", type: "genetica" },
  { value: "teste de mutação BRCA1/BRCA2", type: "genetica" },
];

// Componente de busca avançada de exames
function AdvancedExamSearch({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (val: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [browseOpen, setBrowseOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const normalizeText = (str: string) =>
    str.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  const filtered = useMemo(() => {
    if (selectedType) return allExams.filter((e) => e.type === selectedType);
    const q = normalizeText(query);
    return allExams.filter((e) => normalizeText(e.value).includes(q));
  }, [query, selectedType]);

  const groups = useMemo(
    () =>
      filtered.reduce<Record<string, Exam[]>>((acc, exam) => {
        (acc[exam.type] = acc[exam.type] || []).push(exam);
        return acc;
      }, {}),
    [filtered]
  );

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <Command className="flex-1">
          <CommandInput
            placeholder={
              selectedType
                ? `Filtrando: ${capitalizeFirstLetter(selectedType)}`
                : "Procure exame..."
            }
            value={query}
            onValueChange={(val) => {
              setQuery(val);
              setSelectedType(null);
            }}
            disabled={!!selectedType}
          />
          <CommandList className="h-100 overflow-y-auto">
            <CommandEmpty>Nenhum exame.</CommandEmpty>
            {Object.entries(groups).map(([type, exams]) => (
              <CommandGroup key={type} heading={capitalizeFirstLetter(type)}>
                {exams.map((exam) => (
                  <CommandItem
                    key={exam.value}
                    onSelect={() => {
                      onToggle(exam.value);
                      if (!selectedType) setQuery("");
                    }}
                    className={selected.includes(exam.value) ? "opacity-50" : ""}
                  >
                    {capitalizeFirstLetter(exam.value)}
                    {selected.includes(exam.value) && (
                      <Check className="ml-auto w-4 h-4 text-green-500" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
        {selectedType && (
          <Button
            variant="outline"
            onClick={() => {
              setSelectedType(null);
              setQuery("");
            }}
          >
            <X className="w-4 h-4 mr-1" />Limpar filtro
          </Button>
        )}
        <Button variant="outline" onClick={() => setBrowseOpen(true)}>
          Explorar
        </Button>
        {browseOpen && (
          <Dialog open={browseOpen} onOpenChange={setBrowseOpen}>
            <DialogOverlay className="fixed inset-0 bg-black/50" />
            <DialogContent className="fixed top-1/2 left-1/2 w-full max-w-xs -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-4 shadow-lg">
              <DialogHeader>
                <DialogTitle>Explorar por classe</DialogTitle>
              </DialogHeader>
              <div className="mt-2 space-y-2">
                {Array.from(new Set(allExams.map((e) => e.type))).map((type) => (
                  <Button
                    key={type}
                    variant="ghost"
                    className="w-full text-left"
                    onClick={() => {
                      setSelectedType(type);
                      setQuery("");
                      setBrowseOpen(false);
                    }}
                  >
                    {capitalizeFirstLetter(type)}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

// Componente para prescrição de exames
export function PrescriptionExamPopup({
  isOpen,
  onClose,
  onSubmit,
  patientName,
  patientHealthNumber,
  patientId,
  doctorName,
  doctorId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    patientName: string;
    patientHealthNumber: string;
    patientId:string,
    doctorName: string;
    doctorId:string    
    datePrescribed: string;
    exams: { value: string; observacoes: string ,type:string}[];

  }) => void;
  patientName: string;
  patientHealthNumber: string;
  patientId:string;
  doctorName: string;
  doctorId: string;
}) {
  const [datePrescribed, setDate] = useState<string>(() => new Date().toISOString().substring(0, 10));
  const [exams, setExams] = useState<(Exam & { observacoes: string })[]>([]);
  const [additionalInformation, setAdditionalInformation] = useState<string>("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitExams, setSubmitExams] = useState<{ value: string; observacoes: string, type:string }[]>([]);

  const toggleExam = (val: string) =>
    setExams((prev) => {
      const exists = prev.find((e) => e.value === val);
      if (exists) return prev.filter((e) => e.value !== val);
      const info = allExams.find((e) => e.value === val)!;
      return [...prev, { ...info, observacoes: "" }];
    });

  const updateObservacoes = (value: string, examVal: string) => {
    setExams((prev) =>
      prev.map((e) => (e.value === examVal ? { ...e, observacoes: value } : e))
    );
  };

  const isFormValid = exams.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogOverlay className="fixed inset-0 bg-black/50" />
      <DialogContent className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full ${exams.length>0?'sm:max-w-[80rem]':'sm:max-w-[35rem]'} h-[55rem] overflow-y-auto rounded-2xl bg-white p-6 shadow-lg`}>
        <DialogHeader>
          <DialogTitle>Prescrever Exames</DialogTitle>
        </DialogHeader>
        <div className="flex">
          {/* Coluna esquerda */}
          <div className="flex-1 space-y-4 pr-8">
            <div>
              <Label htmlFor="patient_name">Nome do paciente</Label>
              <Input id="patient_name" value={patientName} disabled />
            </div>
            <div>
              <Label htmlFor="patient_health_number">Número de utente</Label>
              <Input id="patient_health_number" value={patientHealthNumber} disabled />
            </div>
            <div>
              <Label htmlFor="doctor_prescriber">Médico prescritor</Label>
              <Input id="doctor_prescriber" value={`${doctorName} (ID ${doctorId})`} disabled />
            </div>
            <div>
              <Label htmlFor="prescription_date">Data da prescrição</Label>
              <Input id="prescription_date" type="datePrescribed" value={datePrescribed} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="exams">Exames</Label>
              <AdvancedExamSearch selected={exams.map((e) => e.value)} onToggle={toggleExam} />
            </div>
          </div>
          {/* Coluna direita: observações de cada exame */}
          {exams.length > 0 && (
            <div className="flex-shrink-0 w-96 max-h-[39rem] overflow-auto space-y-4">
              <h3 className="text-lg font-semibold mb-2">Exames Selecionados</h3>
              {exams.map((e) => (
                <div key={e.value} className="border p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{capitalizeFirstLetter(e.value)}</span>
                    <Button variant="ghost" size="icon" onClick={() => toggleExam(e.value)}>
                      <X />
                    </Button>
                  </div>
                  <div className="mt-2">
                    <Label htmlFor={`${e.value}_observacoes`}>Observações</Label>
                    <Input
                      id={`${e.value}_observacoes`}
                      value={e.observacoes}
                      onChange={(evt) => updateObservacoes(evt.target.value, e.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter className="mt-6 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-1" />Cancelar
          </Button>
          <Button
            onClick={() => {
              const tmp = exams.map(({ value, observacoes,type }) => ({ value, observacoes,type }));
              setSubmitExams(tmp);
              setConfirmOpen(true);
            }}
            disabled={!isFormValid}
          >
            <Check className="w-4 h-4 mr-1" />Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Diálogo de confirmação */}
      <Dialog open={confirmOpen} onOpenChange={(open) => !open && setConfirmOpen(false)}>
        <DialogOverlay className="fixed inset-0 bg-black/50" />
        <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md sm:max-w-[50rem] h-[40rem] overflow-y-auto rounded-2xl bg-white p-6 shadow-lg">
          <DialogHeader>
            <DialogTitle>Confirmar Prescrição de Exames</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 h-[30rem] overflow-y-auto text-sm">
            <p><strong>Paciente:</strong> {patientName}</p>
            <p><strong>Nº Utente:</strong> {patientHealthNumber}</p>
            <p><strong>Médico:</strong> {doctorName}</p>
            <p><strong>Data:</strong> {datePrescribed}</p>
            <div>
              <strong>Exames:</strong>
              <ul className="ml-4 list-disc">
                {submitExams.map((ex, i) => (
                  <li key={i} className="mb-2">
                    <p><strong>{capitalizeFirstLetter(ex.value)}</strong></p>
                    <p>Observações: {ex.observacoes}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <DialogFooter className="mt-4 flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                onSubmit({
                  patientName,
                  patientHealthNumber,
                  patientId,
                  doctorName,
                  doctorId,
                  datePrescribed,
                  exams: submitExams
                });
                setConfirmOpen(false);
                setExams([]);
              }}
            >
              Confirmar e Submeter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}