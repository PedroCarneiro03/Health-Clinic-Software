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
import { useNavigate } from "react-router-dom";

// Tipo do paciente
type Patient = {
  id: number;
  name: string;
  healthNumber: string;
  phoneNumber: string;
  email: string;
  birthdate: string;
  gender: string;
};

export default function HomePage() {
  const navigate = useNavigate()
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 8;

  React.useEffect(() => {
    const fetchPatients = async () => {
      const idFromSession = sessionStorage.getItem("id");
      const token = sessionStorage.getItem("authToken");

      if (!idFromSession || !token) {
        console.warn("Falta id ou token no sessionStorage.");
        return;
      }

      try {
        const doctorId = parseInt(idFromSession, 10);
        const res = await fetch(`${API_BASE_URL}/api/patients/doctor/${doctorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Erro ao carregar pacientes.");
        const data = await res.json();
        setPatients(data);
      } catch (error) {
        console.error("Erro:", error);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <main className="p-6 flex-1 pb-20">
      <Title text="Lista de Pacientes" />

      <div className="flex justify-end mb-4 space-x-4">
        <Input
          placeholder="Pesquisar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64"
        />
      </div>

      <div className="mt-32">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Nome</TableHead>
              <TableHead className="w-[150px]">Nº Utente</TableHead>
              <TableHead className="w-[150px]">Telefone</TableHead>
              <TableHead className="w-[250px]">Email</TableHead>
              <TableHead className="w-[150px]">Data de Nascimento</TableHead>
              <TableHead className="w-[100px]">Género</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPatients.map((patient) => (
              <TableRow key={patient.id} onClick={()=>navigate(`plan/${patient.id}`)}>
                <TableCell className="font-medium">{patient.name}</TableCell>
                <TableCell className="py-4">{patient.healthNumber}</TableCell>
                <TableCell className="py-4">{patient.phoneNumber}</TableCell>
                <TableCell className="py-4">{patient.email}</TableCell>
                <TableCell className="py-4">{patient.birthdate}</TableCell>
                <TableCell className="py-4 capitalize">{patient.gender}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-500">
          Exibindo {paginatedPatients.length} de {filteredPatients.length} entradas
        </p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} />
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
                <PaginationItem>
                  <span>...</span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}
            <PaginationItem>
              <PaginationNext onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </main>
  );
}
