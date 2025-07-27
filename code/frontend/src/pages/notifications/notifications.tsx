// src/pages/NotificationsPage.tsx
import React, { JSX, useEffect, useState } from "react";

import { Title } from "@/components/title/title";
import { Notification as NotificationItem } from "@/components/notification/notification";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/config/api";

type NotificationType = "message" | "comment" | "alert" | "info" | "default";

const mapNotificationType = (value: number): NotificationType => {
  const map: Record<number, NotificationType> = {
    0: "message",
    1: "comment",
    2: "alert",
    3: "info",
  };
  return map[value] ?? "default";
};

interface Notificacao {
  id: string | number;
  title: string;
  description: string;
  dateTime: string; // renomeado de 'date'
  seen: boolean;
  type: NotificationType;
}

export default function NotificationsPage(): JSX.Element {
  const [notifications, setNotifications] = useState<Notificacao[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notificacao | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const token = sessionStorage.getItem("authToken");
  const id = sessionStorage.getItem("id");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/notifications/user/${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao buscar notificações");
        return res.json();
      })
      .then((data: unknown) => {
        const lista: Notificacao[] = Array.isArray(data)
          ? (data as Partial<Notificacao>[]).map((item) => ({
              id: item.id!,
              title: item.title || "",
              description: item.description || "",
              dateTime: item.dateTime || new Date().toISOString(), // renomeado
              seen: typeof item.seen === "boolean" ? item.seen : false,
              type: mapNotificationType(Number(item.type)),
            }))
          : [];
        setNotifications(lista);
      })
      .catch((err: Error) => console.error(err));
  }, []);

  const sortedNotifications = [...notifications].sort((a, b) => {
    const dateA = new Date(a.dateTime).getTime(); // renomeado
    const dateB = new Date(b.dateTime).getTime();
    return dateB - dateA;
  });

  const hojeList: Notificacao[] = [];
  const ontemList: Notificacao[] = [];
  const antigasList: Notificacao[] = [];

  const agora = new Date();
  const hojeMidnight = new Date(
    agora.getFullYear(),
    agora.getMonth(),
    agora.getDate()
  ).getTime();
  const ontemMidnight = new Date(
    agora.getFullYear(),
    agora.getMonth(),
    agora.getDate() - 1
  ).getTime();

  sortedNotifications.forEach((notif) => {
    const notifDate = new Date(notif.dateTime); // renomeado
    const notifMidnight = new Date(
      notifDate.getFullYear(),
      notifDate.getMonth(),
      notifDate.getDate()
    ).getTime();

    if (notifMidnight === hojeMidnight) {
      hojeList.push(notif);
    } else if (notifMidnight === ontemMidnight) {
      ontemList.push(notif);
    } else {
      antigasList.push(notif);
    }
  });

  const markAsSeen = async (notification: Notificacao): Promise<void> => {
    if (notification.seen) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/${notification.id}/seen`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`Falha ao marcar notificação ${notification.id} como vista`);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, seen: true } : n
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (notif: Notificacao): void => {
    markAsSeen(notif);
    setSelectedNotification({ ...notif, seen: true });
    setIsModalOpen(true);
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
    setSelectedNotification(null);
    window.location.reload()
  };

  const renderSection = (title: string, list: Notificacao[]) => {
    if (list.length === 0) return null;
    return (
      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">{title}</h2>
        <div className="space-y-2">
          {list.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className="w-full cursor-pointer"
            >
              <NotificationItem
                title={n.title}
                description={n.description}
                dateTime={n.dateTime} // renomeado
                read={n.seen}
                type={n.type}
              />
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <>
      <div className="flex-1 px-4">
        <div className="mb-4">
          <Title text="Notificações" />
        </div>

        {renderSection("Hoje", hojeList)}
        {renderSection("Ontem", ontemList)}
        {renderSection("Antigas", antigasList)}

        {notifications.length === 0 && (
          <p className="text-center text-gray-500 mt-8">Não há notificações.</p>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedNotification ? selectedNotification.title : ""}
            </DialogTitle>
            <DialogDescription>
              {selectedNotification ? selectedNotification.description : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="flex justify-between w-full items-center">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Fechar
                </Button>
              </DialogClose>
              {selectedNotification && (
                <span className="text-xs text-gray-500">
                  {new Date(selectedNotification.dateTime).toLocaleString("pt-PT", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
