import { Calendar, Clock, Home, Inbox, Bell, Settings } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menu items.
const upItems = [
  {
    title: "Planos",
    url: "#planos",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "#consultas",
    icon: Clock,
  },
  {
    title: "Calendário",
    url: "#calendario",
    icon: Calendar,
  }
]

const downItems=[

  {
    title: "Notificações",
    url:"#notificacoes",
    icon: Bell
  },
  {
    title: "Definições",
    url: "#definicoes",
    icon: Settings,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {upItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        
      </SidebarFooter>
    </Sidebar>
  )
}
