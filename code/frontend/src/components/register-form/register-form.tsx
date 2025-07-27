import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PhoneInput } from "./phone-input"
import { Country, CountryDropdown } from "./country-dropdown"
import { useEffect, useState } from "react"
import { countries } from "country-data-list"
import { API_BASE_URL } from "@/config/api"
import { useNavigate } from "react-router-dom"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const navigate = useNavigate()

  const defaultAlpha3 = "PRT"
  useEffect(() => {
    const initial = countries.all.find((c) => c.alpha3 === defaultAlpha3)
    if (initial) {
      setSelectedCountry(initial)
    }
  }, [])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)

    const formData = new FormData(event.currentTarget)

    const fullName = formData.get("full_name")
    const healthNumber = formData.get("health_number")
    const dateOfBirth = formData.get("date_of_birth")
    const gender = formData.get("gender")
    const email = formData.get("email")
    const password = formData.get("password")
    const contact = formData.get("contact")
    const nationality = selectedCountry?.name || null

    const payload = {
      name: fullName,
      healthNumber,
      birthdate: dateOfBirth,
      gender,
      email,
      password,
      phoneNumber: contact,
      nationality,
    }

    console.log(JSON.stringify(payload))
    fetch(`${API_BASE_URL}/api/patients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Falha no registo")
        }
        return response.json()
      })
      .then(() => {
        return fetch(`${API_BASE_URL}/api/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ identifier: healthNumber, password }),
        })
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Falha no login após registo")
        }
        return response.json()
      })
      .then((data) => {
        const token = data.token
        const role = data.role
        const id =data.id
        sessionStorage.setItem("authToken", token)
        sessionStorage.setItem("role", role)
        sessionStorage.setItem("id",id)
        navigate("/")
      })
      .catch((err) => {
        console.error("Erro no fluxo de registo/login", err)
        setErrorMessage("Erro ao registar ou iniciar sessão.")
      })
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border border-gray-300 rounded-xl shadow-sm py-6">
        <CardHeader>
          <CardTitle>Criar Conta</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para criar a sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="full_name">Nome Completo *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="Ex: João Silva"
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="health_number">Número de Saúde *</Label>
                <Input
                  id="health_number"
                  name="health_number"
                  type="number"
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="date_of_birth">Data de Nascimento *</Label>
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="gender">Género *</Label>
                <select
                  id="gender"
                  name="gender"
                  required
                  className="w-full rounded-md border border-input px-3 py-2"
                >
                  <option value="">Selecione</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="exemplo@dominio.pt"
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Palavra-passe *</Label>
                <Input id="password" type="password" name="password" required minLength={8} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="contact">Contacto *</Label>
                <PhoneInput id="contact" name="contact" required/>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="nationality">Nacionalidade </Label>
                <CountryDropdown
                  placeholder="Selecione o país"
                  defaultValue="PRT"
                  onChange={(country) => setSelectedCountry(country)}
                />
              </div>

              {errorMessage && (
                <div className="text-red-600 text-sm">{errorMessage}</div>
              )}

              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Criar Conta
                </Button>
              </div>
            </div>

            <div className="mt-4 text-center text-sm">
              Já tem conta?{" "}
              <a href="/login" className="underline underline-offset-4">
                Iniciar sessão
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
