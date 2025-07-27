import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { FileText } from "lucide-react"

import {  useMemo, useState } from "react"


type lineType =
{
  id: string,
  name: string,
  datePrescribed: string,
  doctorName: string,
  patientId? :number, // possivelmente como vai ser uma lista de um único paciente, pode ser ignorado
  observations?: string,
  fileUrl: string,
  type?:string,
}

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Button } from "../ui/button"
import { API_BASE_URL } from "@/config/api"


export function TableExams({lines,filterType,onUpload}:{lines:lineType[], filterType?:string, onUpload: (idUpload: string) => void }) {
  const [currentPage, setCurrentPage] = useState(0);
  const PAGESIZE = 5;
  

  function isAdmin() {
    return sessionStorage.getItem("role") ==="DOCTOR"
  }

  function getFilteredLines() {
    return !filterType ? lines : lines.filter((line) => line.type === filterType);
  }
  
  const [filteredLines, numberOfPages] = useMemo(() => {
    const fLines = getFilteredLines();
  
    const totalPages = Math.ceil(fLines.length / PAGESIZE);
  
    return [fLines, totalPages];
  }, [lines, filterType]);

  const [currentPageLines] = useMemo(() => {
    const start = currentPage * PAGESIZE;
    const end = start + PAGESIZE;
    const pageLines = filteredLines.slice(start, end);
  
    return [pageLines];
  }, [filteredLines, numberOfPages,currentPage]);

  const token = sessionStorage.getItem("authToken");
  function visualizarFicheiro(fileUrl: string) {
    console.log(fileUrl)
    fetch(`${API_BASE_URL}/${fileUrl}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao obter ficheiro");
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
      })
      .catch((err) => {
        console.error(err);
        alert("Falha ao carregar ficheiro.");
      });
  }



  return (<>
    <Table className="border-separate border-spacing-y-4 w-full">
      <TableHeader className="shadow-sm h-15">
        <TableRow >
          <TableHead className="font-medium text-[#B5B7C0]">ID</TableHead>
          <TableHead className="font-medium text-[#B5B7C0]">Nome</TableHead>
          <TableHead className="font-medium text-[#B5B7C0]">Tipo</TableHead>
          <TableHead className="font-medium text-[#B5B7C0]">Data de prescrição</TableHead>
          <TableHead className="font-medium text-[#B5B7C0]">Médico prescritor</TableHead>
          <TableHead className="font-medium text-[#B5B7C0]">Observações</TableHead>
          <TableHead className="font-medium text-[#B5B7C0]  pr-4">Ficheiro</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="bg-white">
        {currentPageLines.map((line) => ( 
          <TableRow key={line.id} className="shadow-[0_1px_1px_1px_rgba(0,0,0,0.1)] align-middle h-15 align middle">
            <TableCell className="font-medium">{line.id}</TableCell>
            <TableCell>{line.name}</TableCell>
            <TableCell>{line.type}</TableCell>
            <TableCell>{line.datePrescribed}</TableCell>
            <TableCell>{line.doctorName}</TableCell>
            {line.observations ? (<TableCell className="max-w-[200px] truncate" title={line.observations}>{line.observations }</TableCell>) : (<TableCell className="text-[#B5B7C0]"> Nenhuma Observação</TableCell>)}
          
            <TableCell className="text-left">
              {line.fileUrl ? (
                <FileText
                  className="cursor-pointer hover:text-blue-600"
                  onClick={() => visualizarFicheiro(line.fileUrl)}
                />
              ) : isAdmin() ? (
                <p
                  className="text-[#4361EE] text-sm cursor-pointer hover:underline"
                  onClick={() => onUpload(line.id)}
                >
                  Adicionar resultados
                </p>
              ) : null}
            </TableCell>

          </TableRow>
        ))}
      </TableBody>
      </Table>
      {numberOfPages > 1 && (
        <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-500">
          Exibindo {currentPageLines.length} de {filteredLines.length} entradas
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
