import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PacientBox } from "@/components/pacient-box/pacient-box";
import { Title } from "@/components/title/title";
import { CarouselButtons } from "@/components/carousel-buttons/carousel-buttons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { API_BASE_URL } from "@/config/api";
type Pacient = {
  name: string;
  birthdate: string;
  height: number;
  weight: number;
  gender: string;
  photoUrl: string;
  vaccinesBookUrl:string;
  healthNumber:string;
  id:string
};

export function PLanoIndividual() {
  const token = sessionStorage.getItem('authToken');
  const { id } = useParams<{ id: string }>();
  const [pacient, setPacient] = useState<Pacient | null>(null);

  useEffect(() => {
    const p=  sessionStorage.getItem("User") ;
    if (id === sessionStorage.getItem("id") && sessionStorage.getItem("role") === "PACIENT" && p)
    {
      setPacient(JSON.parse(p))
    }
    else
    {fetch(`${API_BASE_URL}/api/patients/${id}`,
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
    .catch(err => console.log(err))}
    
    // Aqui podes usar `id` para fazer uma requisição, ex:
    // axios.get(`/api/pacientes/${id}`).then(...)

    /*
    setPacient({
      name: "José António da Silva Costa",
      age: 24,
      height: 1.8,
      weight: 80.5,
      gender: true,
      image_path: "/images/pacient-example.png"
    });*/


  }, [id]);

  return (
    pacient !== null ? (
      <div>
      <Title text="Plano Individual"/>
      <div className="flex w-full">
        <PacientBox user={pacient} />
      </div>
      <div className="lg:px-15 md:px-10 sm:px-5 py-15">
       <CarouselButtons vaccinesBookUrl={pacient.vaccinesBookUrl}/>
      </div>
      <div className="py-15">
      <h3 className="text-3xl font-semibold text-black font-['Poppins-SemiBold',Helvetica] tracking-[-0.60px] mb-8">Resumo Médico</h3>
      
      {/*TODO ver que tipo de informações é preciso inserir nesta página*/}
      <Accordion
      type="single"
      collapsible
      className="w-full"
      defaultValue="item-1"
    > 
    
      <AccordionItem value="item-1">
        <AccordionTrigger>Identificação</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>
            Our flagship product combines cutting-edge technology with sleek
            design. Built with premium materials, it offers unparalleled
            performance and reliability.
          </p>
          <p>
            Key features include advanced processing capabilities, and an
            intuitive user interface designed for both beginners and experts.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Alergias</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>
            We offer worldwide shipping through trusted courier partners.
            Standard delivery takes 3-5 business days, while express shipping
            ensures delivery within 1-2 business days.
          </p>
          <p>
            All orders are carefully packaged and fully insured. Track your
            shipment in real-time through our dedicated tracking portal.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Diagnosticos</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>
            We stand behind our products with a comprehensive 30-day return
            policy. If you&apos;re not completely satisfied, simply return the
            item in its original condition.
          </p>
          <p>
            Our hassle-free return process includes free return shipping and
            full refunds processed within 48 hours of receiving the returned
            item.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-4">
        <AccordionTrigger>Medicação</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>
            We stand behind our products with a comprehensive 30-day return
            policy. If you&apos;re not completely satisfied, simply return the
            item in its original condition.
          </p>
          <p>
            Our hassle-free return process includes free return shipping and
            full refunds processed within 48 hours of receiving the returned
            item.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-5">
        <AccordionTrigger>Dispositivos Médicos</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>
            We stand behind our products with a comprehensive 30-day return
            policy. If you&apos;re not completely satisfied, simply return the
            item in its original condition.
          </p>
          <p>
            Our hassle-free return process includes free return shipping and
            full refunds processed within 48 hours of receiving the returned
            item.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
    </div>
      </div>
    ) : (
      <div>Loading</div>
    )
  );
}
