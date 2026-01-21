import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Lightbulb,
  Search,
  CheckSquare,
  Receipt,
  Mail,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Students", path: "/students" },
  { icon: Lightbulb, label: "Ideas", path: "/ideas" },
  { icon: Search, label: "Idea Research", path: "/research", badge: "AI" },
  { icon: CheckSquare, label: "Tasks", path: "/tasks" },
  { icon: Receipt, label: "Receipts", path: "/receipts" },
  { icon: Mail, label: "AI Email", path: "/email", badge: "AI" },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className="p-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg text-sidebar-primary">
              MentorDesk
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-sidebar-accent transition-colors"
        >
          <ChevronLeft
            className={cn(
              "w-4 h-4 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
