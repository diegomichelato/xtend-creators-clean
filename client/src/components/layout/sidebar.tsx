import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Home, Calendar, Users, Inbox, Star, Package, Settings, BarChart3, Send, FileText, TrendingUp, Share, Bot, Shield, Mail, Target, MessageSquare, Palette, PieChart } from "lucide-react";

interface SidebarProps {
  open: boolean;
}

type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  section?: string;
};

const mainNavItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home
  },
  {
    name: "Campaigns",
    href: "/campaigns",
    icon: Target
  },
  {
    name: "Contacts",
    href: "/contacts",
    icon: Users
  },
  {
    name: "Inbox",
    href: "/inbox",
    icon: Inbox
  }
];

const creatorsNavItems: NavItem[] = [
  {
    name: "Creators",
    href: "/creators",
    icon: Star,
    section: "Creator Management"
  },
  {
    name: "Roster",
    href: "/roster",
    icon: Users,
    section: "Creator Management"
  }
];

const assetsNavItems: NavItem[] = [
  {
    name: "Inventory",
    href: "/inventory-table",
    icon: Package,
    section: "Assets"
  },
  {
    name: "Email Templates",
    href: "/email-templates",
    icon: Mail,
    section: "Assets"
  },
  {
    name: "Media Kits",
    href: "/inventory",
    icon: FileText,
    section: "Assets"
  }
];

const analyticsNavItems: NavItem[] = [
  {
    name: "Analytics",
    href: "/admin-analytics",
    icon: BarChart3,
    section: "Analytics"
  },
  {
    name: "Reports",
    href: "/admin-dashboard",
    icon: PieChart,
    section: "Analytics"
  }
];

const businessNavItems: NavItem[] = [
  {
    name: "Proposals",
    href: "/proposals",
    icon: FileText,
    section: "Business"
  },
  {
    name: "Sales Pipeline",
    href: "/sales-pipeline",
    icon: TrendingUp,
    section: "Business"
  },
  {
    name: "Outreach",
    href: "/outreach",
    icon: Send,
    section: "Business"
  }
];

const settingsNavItems: NavItem[] = [
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    section: "Settings"
  },
  {
    name: "Gmail Settings",
    href: "/gmail-settings",
    icon: Mail,
    section: "Settings"
  }
];

function SidebarSection({ title, items, location, open }: { 
  title: string; 
  items: NavItem[]; 
  location: string; 
  open: boolean;
}) {
  return (
    <div className="mb-6">
      {title && (
        <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </h3>
      )}
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "nav-item",
                isActive && "active"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className={cn(open ? "block" : "hidden md:hidden")}>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function Sidebar({ open }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside 
      id="sidebar" 
      className={cn(
        "fixed top-16 bottom-0 left-0 z-30 w-64 bg-white border-r border-gray-200/60 shadow-sm transform transition-all duration-300",
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-16"
      )}
    >
      {/* Logo/Brand Section - Clean separator */}
      <div className="h-4 border-b border-gray-200/60"></div>

      <nav className="sidebar-nav overflow-y-auto">
        {/* Main Navigation */}
        <SidebarSection 
          title=""
          items={mainNavItems}
          location={location}
          open={open}
        />

        {/* Creator Management */}
        <SidebarSection 
          title="Creator Management"
          items={creatorsNavItems}
          location={location}
          open={open}
        />

        {/* Assets Section */}
        <SidebarSection 
          title="Assets"
          items={assetsNavItems}
          location={location}
          open={open}
        />

        {/* Analytics */}
        <SidebarSection 
          title="Analytics"
          items={analyticsNavItems}
          location={location}
          open={open}
        />

        {/* Business */}
        <SidebarSection 
          title="Business"
          items={businessNavItems}
          location={location}
          open={open}
        />

        {/* Settings */}
        <SidebarSection 
          title="Settings"
          items={settingsNavItems}
          location={location}
          open={open}
        />
      </nav>
    </aside>
  );
}
