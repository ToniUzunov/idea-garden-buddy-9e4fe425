import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Plus,
  CheckSquare,
  Search,
  Calendar,
  Trash2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  student_id: string | null;
  idea_id: string | null;
  created_at: string;
  students?: { name: string } | null;
  ideas?: { title: string } | null;
}

export default function Tasks() {
  const [searchParams] = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
    student_id: "",
    idea_id: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setDialogOpen(true);
    }
  }, [searchParams]);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*, students(name), ideas(title)")
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("priority", { ascending: false });
      if (error) throw error;
      return data as Task[];
    },
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students-list"],
    queryFn: async () => {
      const { data } = await supabase.from("students").select("id, name").order("name");
      return data || [];
    },
  });

  const { data: ideas = [] } = useQuery({
    queryKey: ["ideas-list"],
    queryFn: async () => {
      const { data } = await supabase.from("ideas").select("id, title").order("title");
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("tasks").insert({
        title: data.title,
        description: data.description || null,
        priority: data.priority,
        due_date: data.due_date || null,
        student_id: data.student_id || null,
        idea_id: data.idea_id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["open-tasks-count"] });
      queryClient.invalidateQueries({ queryKey: ["priority-tasks"] });
      toast({ title: "Task created successfully" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to create task", variant: "destructive" });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const newStatus = status === "completed" ? "pending" : "completed";
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["open-tasks-count"] });
      queryClient.invalidateQueries({ queryKey: ["priority-tasks"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["open-tasks-count"] });
      queryClient.invalidateQueries({ queryKey: ["priority-tasks"] });
      toast({ title: "Task deleted" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      due_date: "",
      student_id: "",
      idea_id: "",
    });
    setDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const groupedTasks = {
    pending: filteredTasks.filter((t) => t.status === "pending"),
    in_progress: filteredTasks.filter((t) => t.status === "in_progress"),
    completed: filteredTasks.filter((t) => t.status === "completed"),
  };

  return (
    <AppLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-primary" />
              Tasks
            </h1>
            <p className="text-muted-foreground">
              Manage tasks and to-dos for your students
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(v) =>
                        setFormData({ ...formData, priority: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) =>
                        setFormData({ ...formData, due_date: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Assign to Student</Label>
                    <Select
                      value={formData.student_id}
                      onValueChange={(v) =>
                        setFormData({ ...formData, student_id: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Related Idea</Label>
                    <Select
                      value={formData.idea_id}
                      onValueChange={(v) =>
                        setFormData({ ...formData, idea_id: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select idea" />
                      </SelectTrigger>
                      <SelectContent>
                        {ideas.map((i) => (
                          <SelectItem key={i.id} value={i.id}>
                            {i.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Task</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Kanban-style columns */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Pending */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-warning" />
              Pending ({groupedTasks.pending.length})
            </h3>
            <div className="space-y-3">
              {groupedTasks.pending.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={() =>
                    toggleStatusMutation.mutate({
                      id: task.id,
                      status: task.status,
                    })
                  }
                  onDelete={() => deleteMutation.mutate(task.id)}
                />
              ))}
              {groupedTasks.pending.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No pending tasks
                </p>
              )}
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-info" />
              In Progress ({groupedTasks.in_progress.length})
            </h3>
            <div className="space-y-3">
              {groupedTasks.in_progress.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={() =>
                    toggleStatusMutation.mutate({
                      id: task.id,
                      status: task.status,
                    })
                  }
                  onDelete={() => deleteMutation.mutate(task.id)}
                />
              ))}
              {groupedTasks.in_progress.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No tasks in progress
                </p>
              )}
            </div>
          </div>

          {/* Completed */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              Completed ({groupedTasks.completed.length})
            </h3>
            <div className="space-y-3">
              {groupedTasks.completed.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={() =>
                    toggleStatusMutation.mutate({
                      id: task.id,
                      status: task.status,
                    })
                  }
                  onDelete={() => deleteMutation.mutate(task.id)}
                />
              ))}
              {groupedTasks.completed.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No completed tasks
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function TaskCard({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const isCompleted = task.status === "completed";

  return (
    <div
      className={cn(
        "p-3 rounded-lg border transition-all",
        isCompleted
          ? "bg-muted/50 border-border"
          : "bg-background border-border hover:border-primary/30"
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={onToggle}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "font-medium text-sm",
              isCompleted && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </p>
          {task.due_date && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" />
              {format(new Date(task.due_date), "MMM d")}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                task.priority === "high" && "border-destructive/50 text-destructive",
                task.priority === "medium" && "border-warning/50 text-warning",
                task.priority === "low" && "border-muted-foreground/50"
              )}
            >
              {task.priority}
            </Badge>
            {task.students?.name && (
              <span className="text-xs text-muted-foreground">
                {task.students.name}
              </span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onDelete}
        >
          <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
        </Button>
      </div>
    </div>
  );
}
