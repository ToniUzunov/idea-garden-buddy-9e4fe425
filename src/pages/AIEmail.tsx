import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, Sparkles, Loader2, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AIEmail() {
  const [action, setAction] = useState("compose");
  const [occasion, setOccasion] = useState("");
  const [recipient, setRecipient] = useState("");
  const [topic, setTopic] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateEmail = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-email", {
        body: { action, occasion, recipient, topic, originalEmail },
      });
      if (error) throw error;
      setResult(data.email);
      toast({ title: "Email generated!" });
    } catch (e) {
      toast({ title: "Generation failed - edge function needed", variant: "destructive" });
      setResult("AI email generation requires the edge function to be deployed.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    toast({ title: "Copied to clipboard!" });
  };

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="w-6 h-6 text-primary" />
            AI Email Assistant
            <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded">AI</span>
          </h1>
          <p className="text-muted-foreground">Compose, reply, or rewrite emails with AI</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card border rounded-xl p-5 space-y-4">
            <div className="space-y-2">
              <Label>Action</Label>
              <Select value={action} onValueChange={setAction}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="compose">Compose New Email</SelectItem>
                  <SelectItem value="reply">Reply to Email</SelectItem>
                  <SelectItem value="rewrite">Rewrite Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {action !== "rewrite" && (
              <>
                <div className="space-y-2">
                  <Label>Recipient</Label>
                  <Input placeholder="e.g., Parent, Principal, Student" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Occasion</Label>
                  <Select value={occasion} onValueChange={setOccasion}>
                    <SelectTrigger><SelectValue placeholder="Select occasion" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="progress_update">Progress Update</SelectItem>
                      <SelectItem value="meeting_request">Meeting Request</SelectItem>
                      <SelectItem value="follow_up">Follow Up</SelectItem>
                      <SelectItem value="appreciation">Appreciation</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>{action === "rewrite" ? "Email to Rewrite" : action === "reply" ? "Original Email" : "Topic/Details"}</Label>
              <Textarea
                placeholder={action === "compose" ? "What should the email be about?" : "Paste the email here..."}
                value={action === "compose" ? topic : originalEmail}
                onChange={(e) => action === "compose" ? setTopic(e.target.value) : setOriginalEmail(e.target.value)}
                rows={4}
              />
            </div>

            <Button onClick={generateEmail} disabled={loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Generate Email
            </Button>
          </div>

          <div className="bg-card border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Generated Email</h3>
              {result && (
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              )}
            </div>
            {result ? (
              <div className="bg-secondary/50 rounded-lg p-4 whitespace-pre-wrap text-sm">{result}</div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">
                Your generated email will appear here
              </p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
