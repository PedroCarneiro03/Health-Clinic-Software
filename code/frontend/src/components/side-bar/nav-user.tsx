"use client"

import {
  ChevronsUpDown,
  Edit,
  LogOut,

  User,
} from "lucide-react"

import { useNavigate } from "react-router-dom";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/config/api";

export function NavUser({
  user,
}: {
  user: {
    name: string
    email?: string
    avatar?: string
    specialization?:string
  }
}) {
  const { isMobile } = useSidebar()
  const navigate = useNavigate();
  const role= sessionStorage.getItem("role")

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("User") || "{}")
    const token = sessionStorage.getItem("authToken")
    const photoFilename = userData?.photoUrl
    if (photoFilename && token) {
      fetch(`${API_BASE_URL}/${photoFilename}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Erro ao obter imagem")
          return res.blob()
        })
        .then((blob) => {
          const imageUrl = URL.createObjectURL(blob)
          setAvatarUrl(imageUrl)
        })
        .catch((err) => {
          console.error("Falha ao carregar avatar:", err)
        })
    }
    else {
      // Se não houver filename, usa o ícone por defeito diretamente
      setAvatarUrl(role === "DOCTOR" ? "/icons/doctorAvatar.png" : "/icons/patientAvatar.png")
    }
  }, [])
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={avatarUrl ||"/avatars/shadcn.jpg"} alt={user.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                {role === "DOCTOR" && user.specialization && (
                    <span className="truncate text-xs">{user.specialization}</span>
                  )}
                  {role === "PATIENT" && user.email && (
                    <span className="truncate text-xs">{user.email}</span>
                  )}
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={avatarUrl || "/avatars/shadcn.jpg"} alt={user.name}  />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  {role === "DOCTOR" && user.specialization && (
                    <span className="truncate text-xs">{user.specialization}</span>
                  )}
                  {role === "PATIENT" && user.email && (
                    <span className="truncate text-xs">{user.email}</span>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <User />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {sessionStorage.clear(),navigate("/login")}}>
              <LogOut/>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
