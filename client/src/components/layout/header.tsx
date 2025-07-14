import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import { Search, Bell, Settings, Menu } from "lucide-react";
import xtendLogo from "@assets/xtendcreatroslogo_1749565351026.png";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { data: user } = useQuery({
    queryKey: ['/api/users/me'],
  });

  const fullName = (user as any)?.firstName || (user as any)?.fullName || "User";
  
  return (
    <header className="page-header fixed top-0 left-0 right-0 z-40 h-16">
      <div className="flex items-center justify-between px-6 h-full">
        {/* Left side - Logo and Mobile menu */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleSidebar}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </Button>
          
          {/* Xtend Creators Logo */}
          <div className="flex items-center">
            <img 
              src={xtendLogo} 
              alt="Xtend Creators" 
              className="h-10 w-auto"
            />
          </div>
        </div>

        {/* Right side - Tasks and user info */}
        <div className="flex items-center space-x-6">
          {/* Tasks section */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex space-x-2 text-sm">
              <span className="text-gray-900 font-medium border-b-2 border-gray-900 pb-1">Tasks</span>
              <span className="text-gray-500 font-medium pb-1">Upcoming</span>
              <span className="text-gray-500 font-medium pb-1">All</span>
            </div>
          </div>

          {/* Search */}
          <Button variant="ghost" size="icon" className="p-2 hover:bg-gray-100 rounded-lg">
            <Search className="h-5 w-5 text-gray-600" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="p-2 hover:bg-gray-100 rounded-lg relative">
            <Bell className="h-5 w-5 text-gray-600" />
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="icon" className="p-2 hover:bg-gray-100 rounded-lg">
            <Settings className="h-5 w-5 text-gray-600" />
          </Button>

          {/* User avatar */}
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gray-200 text-gray-700 text-sm font-medium">
                {getInitials(fullName)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:block text-sm font-medium text-gray-900">{fullName}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
