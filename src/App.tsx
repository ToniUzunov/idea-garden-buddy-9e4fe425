import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Ideas from "./pages/Ideas";
import IdeaResearch from "./pages/IdeaResearch";
import Tasks from "./pages/Tasks";
import Receipts from "./pages/Receipts";
import AIEmail from "./pages/AIEmail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/ideas" element={<Ideas />} />
          <Route path="/ideas/:id" element={<Ideas />} />
          <Route path="/research" element={<IdeaResearch />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/receipts" element={<Receipts />} />
          <Route path="/email" element={<AIEmail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
