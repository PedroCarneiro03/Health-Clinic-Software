import * as React from "react"
import {

  Calendar,
  Clock,

  GalleryVerticalEnd,
  Home,
  Bell,
  Settings
} from "lucide-react"

import { NavMain } from "@/components/side-bar/nav-main"

import { NavUser } from "@/components/side-bar/nav-user"
import { TeamSwitcher } from "@/components/side-bar/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useEffect, useMemo, useState } from "react"
import { API_BASE_URL } from "@/config/api"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  team:
    {
      name: "Portal de Saúde",
      logo: GalleryVerticalEnd
    }
  ,
  navMain: [
    {
      title: "Planos",
      url: "/",
      icon: Home,
    },
    {
      title: "Calendário",
      url: "/calendario",
      icon: Calendar,
    },
    {
      title: "Consultas",
      url: "/consultas",
      icon: Clock,
    }
  ],
  downMenu: [
    {
      title: "Notificações",
      url: "/notifications",
      icon: Bell,
    },
    {
      title: "Definições",
      url: "/definicoes",
      icon: Settings,
    },
  ],
}

type UserData = {
  name: string;
  email?: string;
  avatar?: string;
  specialization?:string;
};
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [userData, setUserData] = useState<UserData | null>(null)
  const role = sessionStorage.getItem("role")
  const id = sessionStorage.getItem("id")
  const token = sessionStorage.getItem("authToken")

  // Carrega userData uma única vez
  useEffect(() => {
    const uData = sessionStorage.getItem("User")

    if (uData && JSON.parse(uData).id === id) {
      setUserData(JSON.parse(uData))
      return
    }

    const url =
      role === "PATIENT"
        ? `${API_BASE_URL}/api/patients/${id}`
        : `${API_BASE_URL}/api/doctors/${id}`

    fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao obter dados do utilizador")
        return res.json()
      })
      .then((data) => {
        sessionStorage.setItem("User", JSON.stringify(data))
        setUserData({
          name: data.name,
          email: data.email,
          avatar: data.photoUrl,
          specialization: data.specialization
        })
      })
      .catch(console.error)
  }, [id, role, token])

  // Deriva os itens de navMain conforme o role
  const navMainItems = useMemo(() => {
    return data.navMain
      .filter((item) => !(role === "PATIENT" && item.title === "Calendário"))
      .map((item) =>
        item.title === "Planos" && role === "PATIENT"
          ? { ...item, title: "Meu Plano" }
          : item
      )
  }, [role])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher team={data.team} />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMainItems} />
      </SidebarContent>

      {userData && (
        <SidebarFooter>
          <NavMain items={data.downMenu} />
          <NavUser user={userData} />
        </SidebarFooter>
      )}

      <SidebarRail />
    </Sidebar>
  )
}
