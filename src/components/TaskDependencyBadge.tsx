
import { Badge } from "@/components/ui/badge";
import { CheckCircle, LockClosed } from "lucide-react";

interface TaskDependencyBadgeProps {
  task: {
    id: string;
    title: string;
    status: string;
  };
}

const TaskDependencyBadge = ({ task }: TaskDependencyBadgeProps) => {
  const isCompleted = task.status === 'completed';
  
  return (
    <Badge 
      variant={isCompleted ? "outline" : "secondary"}
      className="flex items-center gap-1"
    >
      {isCompleted ? (
        <CheckCircle className="h-3 w-3" />
      ) : (
        <LockClosed className="h-3 w-3" />
      )}
      <span className="max-w-[100px] truncate">{task.title}</span>
    </Badge>
  );
};

export default TaskDependencyBadge;
