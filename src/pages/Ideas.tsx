import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { Plus, Lightbulb, Search, ExternalLink } from "lucide-react";

interface Idea {
  id: string;
  title: string;
  description: string | null;
  status: string;
  category: string | null;
  student_id: string | null;
  is_team_project: boolean;
  created_at: string;
  students?: { name: string } | null;
}

interface Student {
  id: string;
  name: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  researching: "bg-info/10 text-info border-info/30",
  validated: "bg-success/10 text-success border-success/30",
  archived: "bg-muted text-muted-foreground",
};

export default function Ideas() {
  const [searchParams] = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "draft",
    category: "",
    student_id: "",
    is_team_project: false,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setDialogOpen(true);
    }
  }, [searchParams]);

  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ["ideas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ideas")
        .select("*, students(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Idea[];
    },
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data as Student[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("ideas").insert({
        title: data.title,
        description: data.description || null,
        status: data.status,
        category: data.category || null,
        student_id: data.student_id || null,
        is_team_project: data.is_team_project,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      queryClient.invalidateQueries({ queryKey: ["active-ideas-count"] });
      toast({ title: "Idea created successfully" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to create idea", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      status: "draft",
      category: "",
      student_id: "",
      is_team_project: false,
    });
    setDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch =
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || idea.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-mentor-purple" />
              Ideas
            </h1>
            <p className="text-muted-foreground">
              Document and track student ideas
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Idea
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Idea</DialogTitle>
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
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) =>
                        setFormData({ ...formData, status: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="researching">Researching</SelectItem>
                        <SelectItem value="validated">Validated</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      placeholder="e.g., Technology"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="team"
                      checked={formData.is_team_project}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_team_project: checked })
                      }
                    />
                    <Label htmlFor="team">Team Project</Label>
                  </div>
                </div>
                {!formData.is_team_project && (
                  <div className="space-y-2">
                    <Label htmlFor="student">Assign to Student</Label>
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
                )}
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Idea</Button>
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
              placeholder="Search ideas..."
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
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="researching">Researching</SelectItem>
              <SelectItem value="validated">Validated</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ideas Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading...
          </div>
        ) : filteredIdeas.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery || statusFilter !== "all"
              ? "No ideas found"
              : "No ideas yet. Create your first idea!"}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIdeas.map((idea) => (
              <Link
                key={idea.id}
                to={`/ideas/${idea.id}`}
                className="bg-card rounded-xl border border-border p-5 hover:shadow-md hover:border-primary/30 transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-mentor-purple/10 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-mentor-purple" />
                  </div>
                  <Badge
                    variant="outline"
                    className={statusColors[idea.status]}
                  >
                    {idea.status}
                  </Badge>
                </div>
                <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {idea.title}
                </h3>
                {idea.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {idea.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {idea.is_team_project
                      ? "Team"
                      : idea.students?.name || "Unassigned"}
                  </span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
