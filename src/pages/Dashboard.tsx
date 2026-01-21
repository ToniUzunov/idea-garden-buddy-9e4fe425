import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";
import { PriorityTasks } from "@/components/dashboard/PriorityTasks";
import { RecentIdeas } from "@/components/dashboard/RecentIdeas";
import {
  Users,
  Lightbulb,
  CheckSquare,
  Receipt,
  UserPlus,
  Sparkles,
  ScanLine,
  Rocket,
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();

  // Fetch stats
  const { data: studentsCount = 0 } = useQuery({
    queryKey: ["students-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: activeIdeasCount = 0 } = useQuery({
    queryKey: ["active-ideas-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("ideas")
        .select("*", { count: "exact", head: true })
        .neq("status", "archived");
      return count || 0;
    },
  });

  const { data: openTasksCount = 0 } = useQuery({
    queryKey: ["open-tasks-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .neq("status", "completed");
      return count || 0;
    },
  });

  const { data: pendingReceiptsCount = 0 } = useQuery({
    queryKey: ["pending-receipts-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("receipts")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      return count || 0;
    },
  });

  // Fetch priority tasks
  const { data: priorityTasks = [] } = useQuery({
    queryKey: ["priority-tasks"],
    queryFn: async () => {
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .neq("status", "completed")
        .order("priority", { ascending: false })
        .order("due_date", { ascending: true })
        .limit(5);
      return data || [];
    },
  });

  // Fetch recent ideas
  const { data: recentIdeas = [] } = useQuery({
    queryKey: ["recent-ideas"],
    queryFn: async () => {
      const { data } = await supabase
        .from("ideas")
        .select("*, students(name)")
        .order("created_at", { ascending: false })
        .limit(4);
      return data || [];
    },
  });

  return (
    <AppLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your students and ideas today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Students"
            value={studentsCount}
            icon={<Users className="w-5 h-5" />}
            iconBgColor="bg-warning/10"
            iconColor="text-warning"
          />
          <StatCard
            title="Active Ideas"
            value={activeIdeasCount}
            icon={<Lightbulb className="w-5 h-5" />}
            iconBgColor="bg-mentor-purple/10"
            iconColor="text-mentor-purple"
          />
          <StatCard
            title="Open Tasks"
            value={openTasksCount}
            icon={<CheckSquare className="w-5 h-5" />}
            iconBgColor="bg-primary/10"
            iconColor="text-primary"
          />
          <StatCard
            title="Pending Receipts"
            value={pendingReceiptsCount}
            icon={<Receipt className="w-5 h-5" />}
            iconBgColor="bg-destructive/10"
            iconColor="text-destructive"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-5 gap-6 mb-8">
          <div className="lg:col-span-3">
            <PriorityTasks tasks={priorityTasks} />
          </div>
          <div className="lg:col-span-2">
            <RecentIdeas ideas={recentIdeas} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="section-title mb-4">
            <Rocket className="w-4 h-4" />
            Quick Actions
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionCard
              icon={<UserPlus className="w-5 h-5" />}
              title="Add Student"
              description="Register new student"
              iconBgColor="bg-warning/10"
              iconColor="text-warning"
              onClick={() => navigate("/students?action=add")}
            />
            <QuickActionCard
              icon={<Lightbulb className="w-5 h-5" />}
              title="New Idea"
              description="Document an idea"
              iconBgColor="bg-mentor-purple/10"
              iconColor="text-mentor-purple"
              onClick={() => navigate("/ideas?action=add")}
            />
            <QuickActionCard
              icon={<Sparkles className="w-5 h-5" />}
              title="AI Research"
              description="Analyze an idea"
              iconBgColor="bg-primary/10"
              iconColor="text-primary"
              onClick={() => navigate("/research")}
            />
            <QuickActionCard
              icon={<ScanLine className="w-5 h-5" />}
              title="Scan Receipt"
              description="Upload & organize"
              iconBgColor="bg-destructive/10"
              iconColor="text-destructive"
              onClick={() => navigate("/receipts?action=upload")}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
