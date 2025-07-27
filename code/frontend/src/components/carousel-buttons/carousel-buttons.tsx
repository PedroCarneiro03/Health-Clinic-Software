  import * as React from "react"
  import { Card, CardContent } from "@/components/ui/card"
  import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
  } from "@/components/ui/carousel"
  import { useNavigate , useLocation} from "react-router-dom";

  export function CarouselButtons({ vaccinesBookUrl }: { vaccinesBookUrl: string }) {
      const navigate = useNavigate(); 
      const location = useLocation();
      const content:string[] =
      [
          "exams","prescriptions","vacines"
      ]
      const handleItemClick = (item: string) => {
      if (item === "vacines") {
        const token = sessionStorage.getItem("authToken")
        if (!vaccinesBookUrl || !token) {
          alert("Boletim de vacinas não disponível.")
          return
        }

        fetch(`http://localhost:8081/${vaccinesBookUrl}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => {
            if (!res.ok) throw new Error("Erro ao obter boletim de vacinas")
            return res.blob()
          })
          .then((blob) => {
            const url = URL.createObjectURL(blob)
            window.open(url, "_blank")
          })
          .catch((err) => console.error(err))
      } else {
        navigate(`${location.pathname}/${item}`)
      }
    }
      

    return (
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent>
          {content.map((image, index) => (
            <CarouselItem key={index} className="w-full sm:basis-1/2 md:basis-1/3 lg:basis-1/3">
              <div>
                <Card>
                  <CardContent className="px-0 flex items-center justify-center">

                    <img
                      src={`/icons/${image}.png`}
                      className="lg:w-28 md:w-22 rounded-xl cursor-pointer"
                      onClick={() => handleItemClick(image)}
                      alt={image}
                    />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="lg:hidden md:hidden" />
        <CarouselNext className="lg:hidden md:hidden"/>
      </Carousel>
    )
  }
