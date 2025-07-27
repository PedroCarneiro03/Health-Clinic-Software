import {
  Bell as BellIcon,
  ChevronRight,
  HelpCircle,
  Lock,
  Monitor,
  Shield,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { AppSidebar } from "@/components/side-bar/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Title } from "@/components/title/title";

const SettingsPage = () => {
  // Navigation items data
  


  // Settings categories data
  const settingsCategories = [
    {
      icon: <User className="w-4 h-4" />,
      title: "Your account",
      description:
        "See information about your account, download an archive of your data, or learn about your account deactivation options.",
    },
    {
      icon: <Shield className="w-4 h-4" />,
      title: "Security and account access",
      description:
        "Manage your account's security and keep track of your account's usage including apps that you have connected to your account.",
    },
    {
      icon: <Lock className="w-4 h-4" />,
      title: "Privacy and safety",
      description: "Manage what information you see and share on this app.",
    },
    {
      icon: <BellIcon className="w-4 h-4" />,
      title: "Notifications",
      description:
        "Select the kinds of notifications you get about your activities, interests, and recommendations.",
    },
    {
      icon: <Monitor className="w-4 h-4" />,
      title: "Accessibility, display, and languages",
      description: "Manage how the content is displayed to you.",
    },
    {
      icon: <HelpCircle className="w-4 h-4" />,
      title: "Additional resources",
      description:
        "Check out other places for helpful information to learn more about our products and services.",
    },
    
  ];

  return (


        <div>
        <Title text="Definições"/>

        {/* Settings categories */}
        <div className="space-y-0 max-w-3xl">
          {settingsCategories.map((category, index) => (
            <Card key={index} className="border-none shadow-none">
              <CardContent className="p-0">
                <Button
                  variant="ghost"
                  className="w-full justify-start p-0 h-auto hover:bg-transparent"
                >
                  <div className="flex items-start gap-8">
                    <div className="mt-1">{category.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-[13px] font-semibold text-black text-left font-['Roboto-SemiBold',Helvetica]">
                        {category.title}
                      </h3>
                      <p className="text-xs text-[#444e51] opacity-[0.81] mt-1 text-left font-['Roboto-Regular',Helvetica]">
                        {category.description}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 mt-1" />
                  </div>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
  );
};

export default SettingsPage;
