"use client"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { API_BASE_URL } from "@/config/api"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
  }[]
}) {
  const navigate = useNavigate()
  const [temNaoLidas, setTemNaoLidas] = useState(false)

  useEffect(() => {
    const token = sessionStorage.getItem("authToken")
    const id = sessionStorage.getItem("id")

    if (!token || !id) return

    fetch(`${API_BASE_URL}/api/notifications/user/${id}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        if (Array.isArray(data)) {
          const hasUnseen = data.some((n) => n.seen === false)
          setTemNaoLidas(hasUnseen)
        }
      })
      .catch(() => setTemNaoLidas(false))
  }, [])

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={item.title}
                onClick={() => navigate(item.url)}
              >
                {item.icon && <item.icon />}
                <span className="flex items-center gap-2">
                  {item.title}
                  {item.title === "Notificações" && temNaoLidas && (
                    <span className="text-blue-500 text-sm">●</span>
                  )}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
