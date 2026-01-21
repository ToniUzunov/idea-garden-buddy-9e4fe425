import { Link } from "react-router-dom";
import { ArrowRight, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Idea {
  id: string;
  title: string;
  status: string;
  is_team_project?: boolean;
  students?: { name: string } | null;
}

interface RecentIdeasProps {
  ideas: Idea[];
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  researching: "bg-info/10 text-info",
  validated: "bg-success/10 text-success",
  archived: "bg-muted text-muted-foreground",
};

export function RecentIdeas({ ideas }: RecentIdeasProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="section-header">
        <h3 className="section-title">
          <Lightbulb className="w-4 h-4 text-warning" />
          Recent Ideas
        </h3>
        <Link to="/ideas" className="section-link">
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-2">
        {ideas.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No ideas yet
          </p>
        ) : (
          ideas.slice(0, 4).map((idea) => (
            <Link
              key={idea.id}
              to={`/ideas/${idea.id}`}
              className="idea-card"
            >
              <div className="w-8 h-8 rounded-lg bg-mentor-purple/10 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-4 h-4 text-mentor-purple" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {idea.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="capitalize">{idea.status}</span>
                  {idea.is_team_project ? " • Team" : idea.students?.name ? ` • ${idea.students.name}` : ""}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
