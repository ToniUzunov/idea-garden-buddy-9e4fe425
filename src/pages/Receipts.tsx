import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Receipt, Upload, Camera, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function Receipts() {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: receipts = [], isLoading } = useQuery({
    queryKey: ["receipts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("receipts")
        .select("*, receipt_categories(name, color)")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      // For now, create a placeholder receipt - AI analysis would happen via edge function
      const { error } = await supabase.from("receipts").insert({
        vendor: "Pending Analysis",
        description: `Uploaded: ${file.name}`,
        status: "pending",
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      queryClient.invalidateQueries({ queryKey: ["pending-receipts-count"] });
      toast({ title: "Receipt uploaded! AI analysis coming soon." });
    } catch (e) {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Receipt className="w-6 h-6 text-destructive" />
              Receipts
            </h1>
            <p className="text-muted-foreground">Upload and organize receipts with AI</p>
          </div>
        </div>

        {/* Upload Area */}
        <div className="bg-card border-2 border-dashed border-border rounded-xl p-8 mb-6 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          />
          <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">Upload a Receipt</p>
          <p className="text-sm text-muted-foreground mb-4">AI will analyze and categorize it</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              Upload File
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Camera className="w-4 h-4 mr-2" />
              Take Photo
            </Button>
          </div>
        </div>

        {/* Receipts List */}
        <div className="bg-card rounded-xl border p-5">
          <h3 className="font-semibold mb-4">Recent Receipts</h3>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : receipts.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No receipts yet</p>
          ) : (
            <div className="space-y-3">
              {receipts.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div>
                    <p className="font-medium">{r.vendor || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">{r.description}</p>
                  </div>
                  <div className="text-right">
                    {r.amount && <p className="font-semibold">${r.amount}</p>}
                    <p className="text-xs text-muted-foreground">{format(new Date(r.created_at), "MMM d")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
