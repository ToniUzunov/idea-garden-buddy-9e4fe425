import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Task {
  id: string;
  title: string;
  priority: string;
  due_date?: string | null;
}

interface PriorityTasksProps {
  tasks: Task[];
}

export function PriorityTasks({ tasks }: PriorityTasksProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="section-header">
        <h3 className="section-title">
          <Clock className="w-4 h-4 text-warning" />
          Priority Tasks
        </h3>
        <Link to="/tasks" className="section-link">
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No priority tasks
          </p>
        ) : (
          tasks.slice(0, 4).map((task) => (
            <div key={task.id} className="task-item">
              <div
                className={cn(
                  "priority-dot mt-2",
                  task.priority === "high" && "priority-high",
                  task.priority === "medium" && "priority-medium",
                  task.priority === "low" && "priority-low"
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {task.title}
                </p>
                {task.due_date && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    Due {format(new Date(task.due_date), "MMM d")}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
