import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, Sparkles, Loader2 } from "lucide-react";

export default function IdeaResearch() {
  const [selectedIdea, setSelectedIdea] = useState("");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { data: ideas = [] } = useQuery({
    queryKey: ["ideas-list"],
    queryFn: async () => {
      const { data } = await supabase.from("ideas").select("id, title").order("title");
      return data || [];
    },
  });

  const { data: history = [] } = useQuery({
    queryKey: ["research-history", selectedIdea],
    queryFn: async () => {
      if (!selectedIdea) return [];
      const { data } = await supabase
        .from("research_history")
        .select("*")
        .eq("idea_id", selectedIdea)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!selectedIdea,
  });

  const runResearch = async () => {
    if (!selectedIdea || !query) {
      toast({ title: "Select an idea and enter a query", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-research", {
        body: { ideaId: selectedIdea, query },
      });
      if (error) throw error;
      setResult(data.result);
      toast({ title: "Research complete!" });
    } catch (e) {
      toast({ title: "Research failed - edge function needed", variant: "destructive" });
      setResult("AI research requires the edge function to be deployed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Search className="w-6 h-6 text-primary" />
            Idea Research
            <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded">AI</span>
          </h1>
          <p className="text-muted-foreground">Use AI to research and validate ideas</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Select value={selectedIdea} onValueChange={setSelectedIdea}>
              <SelectTrigger><SelectValue placeholder="Select an idea to research" /></SelectTrigger>
              <SelectContent>
                {ideas.map((i: any) => (
                  <SelectItem key={i.id} value={i.id}>{i.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="What would you like to research? (e.g., 'Analyze market potential', 'Find competitors')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={3}
            />
            <Button onClick={runResearch} disabled={loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Run AI Research
            </Button>
            {result && (
              <div className="bg-card border rounded-xl p-4">
                <h3 className="font-semibold mb-2">Research Result</h3>
                <p className="text-sm whitespace-pre-wrap">{result}</p>
              </div>
            )}
          </div>

          <div className="bg-card border rounded-xl p-5">
            <h3 className="font-semibold mb-4">Research History</h3>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {selectedIdea ? "No research history yet" : "Select an idea to see history"}
              </p>
            ) : (
              <div className="space-y-3">
                {history.map((h: any) => (
                  <div key={h.id} className="p-3 bg-secondary/50 rounded-lg">
                    <p className="text-sm font-medium">{h.query}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{h.result}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
