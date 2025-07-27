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
import { useCallback, useState } from "react"
import { API_BASE_URL } from "@/config/api"
import { useNavigate } from "react-router-dom"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [roleType, setRoleType] = useState<"paciente" | "medico">("paciente")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)

    const formData = new FormData(event.currentTarget)
    const identifier = formData.get("health_number")
    const password = formData.get("password")

    const payload = { identifier, password }
  
    fetch(`${API_BASE_URL}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Falha no login")
        }
        return response.json()
      })
      .then((data) => {
        const token = data.token
        const role = data.role
        const id =data.id
        sessionStorage.setItem("authToken", token)
        sessionStorage.setItem("role", role)
        sessionStorage.setItem("id", id)
        navigate("/")
      })
      .catch((err) => {
        console.error("Erro no fluxo de login", err)
        setErrorMessage("Credenciais inválidas. Verifique o número e a palavra-passe.")
      })
  }, [navigate])

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border border-gray-300 rounded-xl shadow-sm py-6">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Inicie sessão como paciente ou médico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex gap-4 mb-4">
              <Button
                type="button"
                variant={roleType === "paciente" ? "default" : "outline"}
                onClick={() => setRoleType("paciente")}
              >
                Paciente
              </Button>
              <Button
                type="button"
                variant={roleType === "medico" ? "default" : "outline"}
                onClick={() => setRoleType("medico")}
              >
                Médico
              </Button>
            </div>

            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="health_number">
                  {roleType === "paciente" ? "Número de Saúde" : "Identificador"}
                </Label>
                <Input
                  id="health_number"
                  name="health_number"
                  type="text"
                  placeholder={roleType === "paciente" ? "Ex: 123456" : "Ex: ID-MED001"}
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                />
              </div>

              {errorMessage && (
                <div className="text-red-600 text-sm mt-1">{errorMessage}</div>
              )}

              <div className="flex flex-col gap-3 mt-2">
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </div>
            </div>

            <div className="mt-4 text-center text-sm">
              Ainda não tem conta?{" "}
              <a href="/register" className="underline underline-offset-4">
                Registar
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
