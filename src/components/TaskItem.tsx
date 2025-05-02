import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ArrowUpCircle } from "lucide-react";
import { format } from "date-fns";
import TaskDependencyBadge from "./TaskDependencyBadge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TaskItemProps {
  task: {
    id: string;
    title: string;
    status: string;
    priority: string;
    due_date: string | null;
    blockingTasks?: Array<{
      id: string;
      title: string;
      status: string;
    }>;
  };
  onStatusChange: (id: string, status: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onStatusChange }) => {
  // Check if task is blocked by incomplete dependencies
  const isBlocked = task.blockingTasks?.some(bt => bt.status !== 'completed') ?? false;
  
  // Get incomplete blocking tasks for tooltip
  const incompleteBlockingTasks = task.blockingTasks?.filter(bt => bt.status !== 'completed') ?? [];
  
  // Helper function to get status badge variant
  const getStatusVariant = (status: string): 'default' | 'secondary' | 'outline' => {
    switch (status) {
      case 'completed':
        return 'outline';
      case 'in_progress':
        return 'default';
      default:
        return 'secondary';
    }
  };

  // Helper function to get priority badge variant
  const getPriorityVariant = (priority: string): 'default' | 'destructive' | 'outline' => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      default:
        return 'outline';
    }
  };
  
  return (
    <tr className="group">
      <td className="py-4">{task.title}</td>
      <td>
        <Badge variant={getStatusVariant(task.status)}>
          {task.status}
        </Badge>
      </td>
      <td>
        <Badge variant={getPriorityVariant(task.priority)}>
          {task.priority}
        </Badge>
      </td>
      <td>
        {task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : '-'}
      </td>
      <td>
        {task.blockingTasks && task.blockingTasks.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {task.blockingTasks.map(blockingTask => (
              <TaskDependencyBadge 
                key={blockingTask.id}
                task={blockingTask}
              />
            ))}
          </div>
        ) : '-'}
      </td>
      <td>
        <div className="flex items-center space-x-2">
          {task.status !== 'completed' && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onStatusChange(task.id, 'completed')}
                        disabled={isBlocked}
                        className={isBlocked ? "opacity-50 cursor-not-allowed" : ""}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isBlocked ? (
                      <div className="space-y-1">
                        <p className="font-medium">Complete blocking tasks first:</p>
                        <ul className="list-disc list-inside">
                          {incompleteBlockingTasks.map(task => (
                            <li key={task.id}>{task.title}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      "Mark as complete"
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange(task.id, 'in_progress')}
                disabled={isBlocked}
                className={isBlocked ? "opacity-50 cursor-not-allowed" : ""}
              >
                <ArrowUpCircle className="h-4 w-4" />
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange(task.id, 'pending')}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default TaskItem; 