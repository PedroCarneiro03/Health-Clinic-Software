import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

import { useMemo, useState } from "react"
import { FileText } from "lucide-react" // ícone de ficheiro


type medication = {
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
    patientId?: number, // possivelmente como vai ser uma lista de um único paciente, pode ser ignorado
    doctorId?: number, // possivelmente como vai ser uma lista de um único paciente, pode ser ignorado
    additionalInformation?: string,
  }

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { API_BASE_URL } from "@/config/api"



function MedicationInfo({ medications }: { medications: medication[] }) {

  return (
    <HoverCard>
      <HoverCardTrigger>{medications.map(m => m.medication).join(" ")}</HoverCardTrigger>
      <HoverCardContent>
        <ul className="gap-5">
          {medications.map(
            m =><li key ={m.id}>
              <h2 className="text-xl font-semibold">{m.medication}</h2>
              <div className="flex flex-col ">
                <span>Dosagem: {m.dosage}</span>
                <span>
                  Tomar {m.frequency} vezes por dia, ao longo de {m.duration} dias
                </span>
              </div>

            </li>
          )}
        </ul>
      </HoverCardContent>
    </HoverCard>
  )
}




export function TableRecipts({ lines }: { lines: lineType[] }) {
  const [currentPage, setCurrentPage] = useState(0);
  const PAGESIZE = 5;


  const [currentPageLines, numberOfPages] = useMemo(() => {


    const totalPages = Math.ceil(lines.length / PAGESIZE);
    const start = currentPage * PAGESIZE;
    const end = start + PAGESIZE;
    const pageLines = lines.slice(start, end);


    return [pageLines, totalPages];
  }, [lines, currentPage]);


  const token = sessionStorage.getItem("authToken")

  function handleDownloadPrescription(prescriptionId: string) {
    fetch(`${API_BASE_URL}/api/prescriptions/${prescriptionId}/pdf`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error("Erro ao obter receita")
        return res.blob()
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob)
        window.open(url, "_blank")
      })
      .catch(err => {
        console.error("Erro ao descarregar receita:", err)
        alert("Não foi possível obter a receita.")
      })
}


  return (
    <>
    <Table className="border-separate border-spacing-y-4 w-full">
      <TableHeader className="shadow-sm h-15">
        <TableRow >
          <TableHead className="font-medium text-[#B5B7C0]">ID</TableHead>
          <TableHead className="font-medium text-[#B5B7C0]">Data de prescrição</TableHead>
          <TableHead className="font-medium text-[#B5B7C0]">Médico prescritor</TableHead>
          <TableHead className="font-medium text-[#B5B7C0]">Medicamentos</TableHead>{/*talvez alterar para receita */}
          <TableHead className="font-medium text-[#B5B7C0]">Observações</TableHead>
          <TableHead className="font-medium text-[#B5B7C0]">Visualizar Receita</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="bg-white">
        {currentPageLines.map((line) => (
          <TableRow key={line.id} className="shadow-[0_1px_1px_1px_rgba(0,0,0,0.1)] align-middle h-15 align middle">
            <TableCell className="font-medium">{line.id}</TableCell>
            <TableCell>{line.date}</TableCell>
            <TableCell>{line.doctorName}</TableCell>
            <TableCell className="max-w-[200px] truncate" title={line.medications.map(m => m.medication).join(", ")}><MedicationInfo medications={line.medications} /></TableCell>
            <TableCell
                className="max-w-[200px] truncate"
                title={line.additionalInformation?.trim() ? line.additionalInformation : "Nenhuma Observação"}
              >
                <span className={line.additionalInformation?.trim() ? "" : "text-[#B5B7C0]"}>
                  {line.additionalInformation?.trim() || "Nenhuma Observação"}
                </span>
              </TableCell>
            <TableCell>
              <FileText
                className="cursor-pointer hover:text-blue-600"
                onClick={() => handleDownloadPrescription(line.id)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      </Table>
      {numberOfPages > 1 && (
        <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-500">
          Exibindo {currentPageLines.length} de {lines.length} entradas
        </p>
      
      <Pagination>
      <PaginationContent>
        {currentPage != 0 &&(
        <PaginationItem onClick={()=>setCurrentPage(currentPage-1)}>
          <PaginationPrevious />
        </PaginationItem>)}
        {Array.from({ length: numberOfPages }, (_, i) => (
        <PaginationItem onClick={()=>setCurrentPage(i)} key={i}>
          <PaginationLink isActive={currentPage==i}>{i + 1}</PaginationLink>
        </PaginationItem>
      ))}
  
      
        {currentPage != numberOfPages-1 &&(
        <PaginationItem onClick={()=>setCurrentPage(currentPage+1)}>
          <PaginationNext />
        </PaginationItem>)}
      </PaginationContent>
    </Pagination>
      </div>
      )}
    </>

  )
}
