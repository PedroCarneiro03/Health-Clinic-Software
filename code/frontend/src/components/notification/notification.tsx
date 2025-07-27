import {
  MessageCircleMore,
  MessageSquare,
  AlertCircle,
  Info,
  Bell,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type NotificationType = "message" | "comment" | "alert" | "info" | "default";

interface NotificationProps {
  title: string;
  description: string;
  dateTime: string;    // alterado de `date`
  read: boolean;
  type?: NotificationType;
}

/**
 * Retorna o componente de ícone apropriado com base no tipo de notificação.
 */
function getIconByType(type: NotificationType) {
  switch (type) {
    case "message":
      return MessageSquare;
    case "comment":
      return MessageCircleMore;
    case "alert":
      return AlertCircle;
    case "info":
      return Info;
    default:
      return Bell;
  }
}

export function Notification({
  title,
  description,
  dateTime,
  read,
  type = "default",
}: NotificationProps) {
  const IconComponent = getIconByType(type);

  return (
    <Alert className="items-center">
      <IconComponent />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>

      <div className="mt-1 flex items-center justify-between text-xs text-gray-500 space-x-4">
        <span className="whitespace-nowrap">
          {new Date(dateTime).toLocaleString("pt-PT", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        {!read && (
          <span className="text-blue-600 font-medium whitespace-nowrap">
            ● Não lida
          </span>
        )}
      </div>
    </Alert>
  );
}
