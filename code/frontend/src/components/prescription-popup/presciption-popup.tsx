import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

function capitalizeFirstLetter(str: string): string {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}


// Dados de exemplo de medicamentos
type Med = {
  value: string;
  type: string;
  dosages: string[];
};

// Lista de medicamentos com dosagens de exemplo por tipo
const allMeds: Med[] = [
  // Analgésicos
  { value: "ibuprofeno",    type: "analgésico", dosages: ["200 mg", "400 mg", "600 mg"] },
  { value: "paracetamol",    type: "analgésico", dosages: ["500 mg", "750 mg", "1 g"] },
  { value: "naproxeno",      type: "analgésico", dosages: ["250 mg", "500 mg"] },
  { value: "diclofenaco",    type: "analgésico", dosages: ["25 mg", "50 mg", "75 mg"] },

  // Antibióticos
  { value: "amoxicilina",    type: "antibiótico", dosages: ["250 mg", "500 mg", "1 g"] },
  { value: "azitromicina",   type: "antibiótico", dosages: ["250 mg", "500 mg"] },
  { value: "ciprofloxacino", type: "antibiótico", dosages: ["250 mg", "500 mg", "750 mg"] },
  { value: "ceftriaxona",    type: "antibiótico", dosages: ["250 mg", "1 g"] },

  // Anti-hipertensores
  { value: "enalapril",      type: "anti-hipertensor", dosages: ["2.5 mg", "5 mg", "10 mg"] },
  { value: "losartan",       type: "anti-hipertensor", dosages: ["25 mg", "50 mg", "100 mg"] },
  { value: "metoprolol",     type: "anti-hipertensor", dosages: ["25 mg", "50 mg", "100 mg"] },

  // Hipolipemiantes
  { value: "simvastatina",   type: "hipolipemiante", dosages: ["10 mg", "20 mg", "40 mg"] },
  { value: "atorvastatina",  type: "hipolipemiante", dosages: ["10 mg", "20 mg", "40 mg", "80 mg"] },

  // Inibidores de bomba de prótons
  { value: "omeprazol",      type: "inibidor de bomba de prótons", dosages: ["10 mg", "20 mg", "40 mg"] },
  { value: "pantoprazol",    type: "inibidor de bomba de prótons", dosages: ["20 mg", "40 mg"] },

  // Anti-histamínicos
  { value: "loratadina",     type: "anti-histamínico", dosages: ["10 mg"] },
  { value: "cetirizina",     type: "anti-histamínico", dosages: ["5 mg", "10 mg"] },

  // Broncodilatadores
  { value: "salbutamol",     type: "broncodilatador", dosages: ["100 mcg/dose (aerossol)", "2 mg (oral)"] },
  { value: "formoterol",     type: "broncodilatador", dosages: ["12 mcg/dose (aerossol)"] },

  // Anti-diabéticos
  { value: "metformina",     type: "anti-diabético", dosages: ["500 mg", "850 mg", "1 g"] },
  { value: "insulina",       type: "anti-diabético", dosages: ["10 UI/mL", "100 UI/mL"] },
];


// Normalização de texto (remove acentos)
const normalizeText = (str: string) =>
  str.normalize("NFD").replace(/[̀-\u036f]/g, "").toLowerCase();

// Medication with settings
type SelectedMed = { value: string; dosage: string; frequency: string; duration: string, dosages:string[]};
type SubmitMed = Omit<SelectedMed, "type" | "dosages">;

// AdvancedMedSearch (inalterado)
function AdvancedMedSearch({ selected, onToggle }: { selected: string[]; onToggle: (val: string) => void; }) {
  const [query, setQuery] = useState("");
  const [browseOpen, setBrowseOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const filtered = useMemo(() => {
    if (selectedType) return allMeds.filter((m) => m.type === selectedType);
    const q = normalizeText(query);
    console.log("🔍 Filtrando para:", JSON.stringify(q));
    return allMeds.filter((m) => normalizeText(m.value).includes(q));
  }, [query, selectedType]);
  const groups = useMemo(
    () => filtered.reduce<Record<string, Med[]>>((acc, med) => {
      
      (acc[med.type] = acc[med.type] || []).push(med);
      
      return acc;
    }, {}),
    [filtered]
  );
  return (
    <div>
      <div className="flex gap-2 mb-2">
        <Command className="flex-1">
          <CommandInput
            placeholder={selectedType ? `Filtrando: ${capitalizeFirstLetter(selectedType)}` : "Procure medicamento..."}
            value={query}
            onValueChange={(val) => { setQuery(val); setSelectedType(null); console.log("🚧 onValueChange:", JSON.stringify(val)); }}
            disabled={!!selectedType}
          />
          <CommandList className="h-100 overflow-y-auto">
            <CommandEmpty>Nenhum medicamento.</CommandEmpty>
            {Object.entries(groups).map(([type, meds]) => (
              <CommandGroup key={type} heading={capitalizeFirstLetter(type)}>
                {meds.map((med) => (
                  <CommandItem
                    key={med.value}
                    onSelect={() => { onToggle(med.value); if (!selectedType) setQuery(""); }}
                    className={selected.includes(med.value) ? "opacity-50" : ""}
                  >
                    {capitalizeFirstLetter(med.value)}
                    {selected.includes(med.value) && <Check className="ml-auto w-4 h-4 text-green-500" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
        {selectedType && (
          <Button variant="outline" onClick={() => { setSelectedType(null); setQuery(""); }}>
            <X className="w-4 h-4 mr-1" />Limpar filtro
          </Button>
        )}
        <Dialog open={browseOpen} onOpenChange={setBrowseOpen}>
          <DialogTrigger asChild><Button variant="outline">Explorar</Button></DialogTrigger>
          <DialogOverlay className="fixed inset-0 bg-black/50" />
          <DialogContent className="fixed top-1/2 left-1/2 w-full max-w-xs -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-4 shadow-lg">
            <DialogHeader>
              <DialogTitle>Explorar por classe</DialogTitle>
            </DialogHeader>
            <div className="mt-2 space-y-2">
              {Array.from(new Set(allMeds.map((m) => m.type))).map((type) => (
                <Button
                  key={type}
                  variant="ghost"
                  className="w-full text-left"
                  onClick={() => { setSelectedType(type); setQuery(""); setBrowseOpen(false); }}
                >{capitalizeFirstLetter(type)}</Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// PrescreverReceitaPopup com modal mais largo e coluna direita
export function PrescriptionPopup({
  isOpen,
  onClose,
  onSubmit,
  patientName,
  patientHealthNumber,
  patitentId,
  doctorName,
  doctorId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { patientName:string, patientHealthNumber:string,patitentId:string, doctorName:string, doctorId:string ,date: string; medications: SubmitMed[] ,adicionalInformation:String}) => void;
  patientName: string;
  patientHealthNumber: string;
  patitentId:string,
  doctorName: string;
  doctorId: string;
}) {
    const [date, setDate] = useState<string>(() => new Date().toISOString().substring(0,10));
  const [meds, setMeds] = useState<SelectedMed[]>([]);
  const [adicionalInformation,setAdicionalInformation] = useState("")
  const [confirmOpen,setConfirmOpen]= useState(false)
  const [submitMeds,setSubmitMeds]= useState<SubmitMed[]>([]) 

  const toggleMed = (val: string) => setMeds((prev) => {
    const exists = prev.find((m) => m.value === val);
    if (exists) return prev.filter((m) => m.value !== val);
    const info = allMeds.find((m) => m.value === val)!;
    return [...prev, { ...info, dosage: "", frequency: "", duration: "" }];
  });

  const updateSetting = (value: string, field: keyof SelectedMed, medVal: string) => {
    setMeds((prev) => prev.map((m) => (m.value === medVal ? { ...m, [field]: value } : m)));
  };

  const isFormValid = 
  meds.length > 0 &&
  meds.every(m => 
    m.dosage.trim() !== "" &&
    m.frequency.trim() !== "" &&
    m.duration.trim() !== ""
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogOverlay className="fixed inset-0 bg-black/50" />
      {/* Aumenta max-width do modal para exibir coluna direita sem sobreposição */}
      <DialogContent className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full ${meds.length>0?'sm:max-w-[80rem]':'sm:max-w-[35rem]'} h-[55rem] overflow-y-auto rounded-2xl bg-white p-6 shadow-lg`}>


        <DialogHeader>
          <DialogTitle>Prescrever Receita</DialogTitle>
        </DialogHeader>
        <div className="flex">
          {/* Coluna esquerda: info e pesquisa */}
          <div className="flex-1 space-y-4 pr-8">
            <div><Label htmlFor="patient_name">Nome do paciente</Label><Input id="patient_name" value={patientName} disabled /></div>
            <div><Label htmlFor="patitent_health_number">Número de utente</Label><Input id="patitent_health_number" value={patientHealthNumber} disabled /></div>
            <div><Label htmlFor="doctor_prescriber">Médico prescritor</Label><Input id="doctor_prescriber" value={`${doctorName} (ID ${doctorId})`} disabled /></div>
            <div><Label htmlFor="prescription_date">Data da prescrição</Label><Input id="prescription_date" type="date" value={date} onChange={(e) => setDate(e.target.value) }/></div>
            <div><Label htmlFor="medications">Medicamentos</Label><AdvancedMedSearch selected={meds.map((m) => m.value)} onToggle={toggleMed} /></div>
            <div><Label htmlFor="adicional_information">Informações Adicionais</Label><Input id="adicional_information" value={adicionalInformation} onChange={(e) => setAdicionalInformation(e.target.value)}/></div>
          </div>
          {/* Coluna direita: configurações por med */}
          {meds.length > 0 && (
            <div className="flex-shrink-0 w-96 max-h-[39rem] overflow-auto space-y-4">
                <h3 className="text-lg font-semibold mb-2">Medicamentos Selecionados</h3>
              {meds.map((m) => (
                <div key={m.value} className="border p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{capitalizeFirstLetter(m.value)}</span>
                    <Button variant="ghost" size="icon" onClick={() => toggleMed(m.value)}><X /></Button>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    {/* Dropdown de dosagens */}
                    <div>
                      <Label htmlFor={`${m.value}_dosage`}>Dosagem</Label>
                      <Select
                        value={m.dosage}
                        onValueChange={(value) => updateSetting(value, "dosage", m.value)}
                      >
                        <SelectTrigger id={`${m.value}_dosage`}>
                          <SelectValue placeholder="Escolher" />
                        </SelectTrigger>
                        <SelectContent>
                          {m.dosages.map((dose) => (
                            <SelectItem key={dose} value={dose}>
                              {dose}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label htmlFor={`${m.value}_frequency`} >Frequência</Label><Input id={`${m.value}_frequency`} placeholder="2x/dia" value={m.frequency} onChange={(e) => updateSetting(e.target.value, 'frequency', m.value)} /></div>
                    <div><Label htmlFor={`${m.value}_duration`}>Duração</Label><Input id={`${m.value}_duration`} placeholder="7 dias" value={m.duration} onChange={(e) => updateSetting(e.target.value, 'duration', m.value)} /></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter className="mt-6 flex justify-end space-x-3">
          {!isFormValid && meds.length > 0 && (
            <p className="text-sm text-red-500 mt-2">
              Preencha dosagem, frequência e duração para todos os medicamentos.
            </p>
          )}  
          <Button  variant="outline" onClick={onClose} ><X className="w-4 h-4 mr-1 " />Cancelar</Button>
          <Button
            onClick={() => {
              // Remove type e dosages automaticamente
              const tmp: SubmitMed[] = meds.map(
                ({ value, dosage, frequency, duration }) => ({
                  value,
                  dosage,
                  frequency,
                  duration,
                })
              );
              setSubmitMeds(tmp)
              setConfirmOpen(true)
            }}
            disabled={!isFormValid}
          >
            <Check className="w-4 h-4 mr-1" />
            Confirmar
          </Button>
          
        </DialogFooter>
      </DialogContent>

      {/* --- Diálogo de confirmação --- */}
      <Dialog open={confirmOpen} onOpenChange={(open) => !open && setConfirmOpen(false)}>
        <DialogOverlay className="fixed inset-0 bg-black/50" />
        <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md sm:max-w-[50rem] h-[40rem] overflow-y-auto rounded-2xl bg-white p-6 shadow-lg">
          <DialogHeader>
            <DialogTitle>Confirmar Receita</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 h-[30rem] overflow-y-auto text-sm">
            <p><strong>Paciente:</strong> {patientName}</p>
            <p><strong>Nº Utente:</strong> {patientHealthNumber}</p>
            <p><strong>Médico:</strong> {doctorName}</p>
            <p><strong>Data:</strong> {date}</p>

            <div>
              <strong>Medicamentos:</strong>
              <ul className="ml-4 list-disc">
                {submitMeds.map((med, i) => (
                  <li key={i} className="mb-2">
                    <p><strong>{capitalizeFirstLetter(med.value)}</strong></p>
                    <p>Dosagem: {med.dosage}</p>
                    <p>Frequência: {med.frequency}</p>
                    <p>Duração: {med.duration}</p>
                  </li>
                ))}
              </ul>
            </div>

            {adicionalInformation && (
              <p><strong>Info. Adicionais:</strong> {adicionalInformation}</p>
            )}
          </div>

          <DialogFooter className="mt-4 flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() =>{
              

              onSubmit({
                patientName,
                patientHealthNumber,
                patitentId,
                doctorName,
                doctorId,
                date,
                medications: submitMeds,
                adicionalInformation
              });
              setConfirmOpen(false)
              setMeds([])
            }}>
              Confirmar e Submeter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </Dialog>

    
  );
}