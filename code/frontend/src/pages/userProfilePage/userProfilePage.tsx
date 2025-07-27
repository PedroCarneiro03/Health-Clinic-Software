import  { useState, useEffect, FormEvent, useMemo, ChangeEvent } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PhoneInput } from '@/components/register-form/phone-input'
import { API_BASE_URL } from '@/config/api'
import { json } from 'stream/consumers'

type UserProfile = {
  name: string
  healthNumber: string
  birthdate: string
  gender: string
  email: string
  phoneNumber: string
  nationality: string
  weight?: number
  height?: number
}

type DoctorProfile = {
  id: string
  name: string
  specialization: string
}

export function UserProfilePage() {
  const [profile, setProfile] = useState<UserProfile | DoctorProfile | null>(null)
  const [formState, setFormState] = useState<any>({}) // pode ser UserProfile ou DoctorProfile

  const id = sessionStorage.getItem("id")
  const token = sessionStorage.getItem("authToken")
  const role = sessionStorage.getItem("role") // assume que tens "PATIENT" ou "DOCTOR"
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedVacine, setSelectedVacine] = useState<File | null>(null)

  useEffect(() => {
    const data = JSON.parse(sessionStorage.getItem("User") || "{}")
    if (data) {
      setProfile(data)
      setFormState(data)
    } else {
      console.error("Falha ao obter dados do utilizador");
    }
  }, [])

  const isDirty = useMemo(() => {
    return profile
      ? JSON.stringify(formState) !== JSON.stringify(profile)
      : false
  }, [formState, profile])

  const handleChange = (key: string, value: string) => {
    setFormState(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!isDirty) return
    fetch(`${API_BASE_URL}/api/${role === "DOCTOR" ? "doctors" : "patients"}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(formState),
    })
      .then(res => {
        if (!res.ok) throw new Error('Falha ao atualizar perfil')
        return res.json()
      })
      .then((updated) => {
        setProfile(updated)
        setFormState(updated)
        sessionStorage.setItem("User", JSON.stringify(updated))
        window.location.reload()
      })
      .catch(err => console.error(err))
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
  }
  const handleVancineChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedVacine(file)
  }

  const handlePhotoUpload = () => {
    if (!selectedFile) return
    const formData = new FormData()
    formData.append("file", selectedFile)

    fetch(`${API_BASE_URL}/api/${role === "DOCTOR" ? "doctors" : "patients"}/${id}/photo`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    })
      .then(res => {
        if (!res.ok) throw new Error('Falha ao atualizar foto')
        return res.json()
      })
      .then((updated) => {
        alert("Foto atualizada com sucesso!")
        sessionStorage.setItem("User", JSON.stringify(updated))
        setSelectedFile(null)
        window.location.reload()
      })
      .catch(err => console.error(err))
  }
  const handleVacineUpload = () => {
    if (!selectedVacine) return
    const formData = new FormData()
    formData.append("file", selectedVacine)

    fetch(`${API_BASE_URL}/api/${role === "DOCTOR" ? "doctors" : "patients"}/${id}/vaccines-book`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    })
      .then(res => {
        if (!res.ok) throw new Error('Falha ao adicinar boletim de vacinas')
        return res.json()
      })
      .then((updated) => {
        alert("Boletim de Vacinas adicionado com sucesso!")
        sessionStorage.setItem("User", JSON.stringify(updated))
        setSelectedVacine(null)
        window.location.reload()
      })
      .catch(err => console.error(err))
  }

  if (!profile) {
    return <div>Carregando perfil...</div>
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Perfil de {role === "DOCTOR" ? "Médico" : "Utente"}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            name="name"
            value={formState.name}
            onChange={e => handleChange('name', e.target.value)}
          />
        </div>

        {role === "DOCTOR" && (
          <>
            <div>
              <Label htmlFor="id">ID</Label>
              <Input
                id="id"
                name="id"
                value={formState.id}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="specialization">Especialização</Label>
              <Input
                id="specialization"
                name="specialization"
                value={formState.specialization}
                onChange={e => handleChange('specialization', e.target.value)}
              />
            </div>
          </>
        )}

        {role === "PATIENT" && (
          <>
            <div>
              <Label htmlFor="healthNumber">Número de Utente</Label>
              <Input id="healthNumber" value={formState.healthNumber} disabled />
            </div>
            <div>
              <Label htmlFor="birthdate">Data de Nascimento</Label>
              <Input id="birthdate" type="date" value={formState.birthdate} disabled />
            </div>
            <div>
              <Label htmlFor="gender">Género</Label>
              <Select value={formState.gender} disabled>
                <SelectTrigger id="gender"><SelectValue placeholder="Selecionar género" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Feminino</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={formState.email} onChange={e => handleChange('email', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Contacto</Label>
              <PhoneInput id="phoneNumber" value={formState.phoneNumber} onChange={val => handleChange('phoneNumber', val)} />
            </div>
            <div>
              <Label htmlFor="nationality">Nacionalidade</Label>
              <Input id="nationality" value={formState.nationality} disabled />
            </div>

            <div>
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                min={0}
                step={1}
                value={formState.weight ?? ""}
                onChange={e => handleChange("weight", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="height">Altura (cm)</Label>
              <Input
                id="height"
                name="height"
                type="number"
                min={0}
                step={1}
                value={formState.height ?? ""}
                onChange={e => handleChange("height", e.target.value)}
              />
            </div>

          </>
          
        )}

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={!isDirty}
            variant={isDirty ? undefined : 'outline'}
            className={`${isDirty ? 'shadow-lg scale-105' : ''}`}
          >
            {isDirty ? 'Guardar Alterações' : 'Guardar'}
          </Button>
        </div>
      </form>

      <div className="mt-10 border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">Atualizar Fotografia</h2>
        <div className="space-y-4">
          <Input type="file" accept="image/*" onChange={handleFileChange} />
          <Button onClick={handlePhotoUpload} disabled={!selectedFile}>
            Enviar Fotografia
          </Button>
        </div>
      </div>
      {role === "PATIENT" && (
        <div className="mt-10 border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Atualizar Boletim de Vacinas</h2>
          <div className="space-y-4">
            <Input type="file" accept="application/pdf" onChange={handleVancineChange} />
            <Button onClick={handleVacineUpload} disabled={!selectedVacine}>
              Enviar Boletim de Vacinas
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
