import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ArrowUpCircle, ArrowDownCircle, Trash2, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import TaskDependencyBadge from "./TaskDependencyBadge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';

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
    description?: string;
  };
  allTasks?: Array<{ id: string; title: string; status: string }>;
  onStatusChange: (id: string, status: string) => void;
  onPriorityChange: (id: string, priority: string) => void;
  onDependenciesChange?: (id: string, dependencies: string[]) => void;
  onDelete: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, allTasks, onStatusChange, onPriorityChange, onDependenciesChange, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editStatus, setEditStatus] = useState(task.status);
  const [editPriority, setEditPriority] = useState(task.priority);
  const [showStatusSelect, setShowStatusSelect] = useState(false);
  const statusSelectRef = useRef<HTMLDivElement>(null);
  const [editDueDate, setEditDueDate] = useState(task.due_date ? new Date(task.due_date) : null);
  const [editDueTime, setEditDueTime] = useState(task.due_date ? (() => {
    const d = new Date(task.due_date);
    return d ? d.toTimeString().slice(0,5) : '';
  })() : '');
  const [editDependencies, setEditDependencies] = useState<string[]>(task.blockingTasks?.map(t => t.id) || []);

  useEffect(() => {
    if (!showStatusSelect) return;
    function handleClickOutside(event: MouseEvent) {
      if (statusSelectRef.current && !statusSelectRef.current.contains(event.target as Node)) {
        setShowStatusSelect(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatusSelect]);

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
  
  // Helper to increase priority
  const increasePriority = () => {
    const priorities = ['low', 'medium', 'high'];
    const currentIdx = priorities.indexOf(task.priority);
    if (currentIdx < priorities.length - 1) {
      const newPriority = priorities[currentIdx + 1];
      setEditPriority(newPriority);
      if (onPriorityChange) {
        onPriorityChange(task.id, newPriority);
      }
    }
  };

  // Helper to decrease priority
  const decreasePriority = () => {
    const priorities = ['low', 'medium', 'high'];
    const currentIdx = priorities.indexOf(task.priority);
    if (currentIdx > 0) {
      const newPriority = priorities[currentIdx - 1];
      setEditPriority(newPriority);
      if (onPriorityChange) {
        onPriorityChange(task.id, newPriority);
      }
    }
  };

  return (
    <>
      <tr className="group">
        <td className="py-4">
          <span
            className="cursor-pointer no-underline hover:underline text-primary"
            onClick={() => setShowDetails(true)}
            tabIndex={0}
            role="button"
          >
            {task.title}
          </span>
        </td>
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
                <TooltipProvider delayDuration={100}>
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
                        "Mark as completed"
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={increasePriority}
                          disabled={task.priority === 'high'}
                        >
                          <ArrowUpCircle className="h-4 w-4" />
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Increase priority
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={decreasePriority}
                          disabled={task.priority === 'low'}
                        >
                          <ArrowDownCircle className="h-4 w-4" />
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Decrease priority
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowStatusSelect((v) => !v)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Change status
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {showStatusSelect && (
                  <div ref={statusSelectRef} className="absolute z-50 mt-2">
                    <Select
                      value={task.status}
                      onValueChange={value => {
                        setShowStatusSelect(false);
                        onStatusChange(task.id, value);
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={onDelete}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Delete task
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
            {task.status === 'completed' ? (
              <Button
                size="sm"
                variant="outline"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </td>
      </tr>
      {/* Task Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {!isEditing ? (
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Title:</span> {task.title}
              </div>
              <div>
                <span className="font-semibold">Description:</span> {task.description || 'No description'}
              </div>
              <div>
                <span className="font-semibold">Status:</span> {task.status}
              </div>
              <div>
                <span className="font-semibold">Priority:</span> {task.priority}
              </div>
              <div>
                <span className="font-semibold">Due Date:</span> {task.due_date ? format(new Date(task.due_date), 'PPP') : '-'}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
                <Button variant="secondary" onClick={() => setShowDetails(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form
              onSubmit={e => {
                e.preventDefault();
                // Call onStatusChange or a new onEdit handler here if needed
                // For now, just close edit mode
                setIsEditing(false);
              }}
              className="space-y-2"
            >
              <div>
                <label className="font-semibold">Title:</label>
                <Input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <label className="font-semibold">Description:</label>
                <Textarea
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="font-semibold">Status:</label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="font-semibold">Priority:</label>
                <Select value={editPriority} onValueChange={value => {
                  setEditPriority(value);
                  if (onPriorityChange) {
                    onPriorityChange(task.id, value);
                  }
                }}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="font-semibold">Due Date:</label>
                <div className="flex gap-2 items-center">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={"w-full pl-3 text-left font-normal" + (!editDueDate ? " text-muted-foreground" : "")}
                      >
                        {editDueDate ? (
                          format(editDueDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={editDueDate ?? undefined}
                        onSelect={date => {
                          if (date && editDueTime) {
                            const [hours, minutes] = editDueTime.split(":").map(Number);
                            date.setHours(hours);
                            date.setMinutes(minutes);
                          }
                          setEditDueDate(date);
                        }}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={editDueTime}
                    onChange={e => {
                      setEditDueTime(e.target.value);
                      if (editDueDate && e.target.value) {
                        const [hours, minutes] = e.target.value.split(":").map(Number);
                        const newDate = new Date(editDueDate);
                        newDate.setHours(hours);
                        newDate.setMinutes(minutes);
                        setEditDueDate(newDate);
                      }
                    }}
                    style={{ minWidth: 100 }}
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold">Dependencies (Blocking Tasks):</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      Select blocking tasks
                      <CalendarIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <div className="p-2">
                      <Input
                        placeholder="Search tasks..."
                        onChange={() => {}}
                        className="mb-2"
                        disabled
                      />
                      <div className="max-h-40 overflow-y-auto">
                        {(allTasks || []).filter(t => t.id !== task.id && t.status !== 'completed').map(t => (
                          <div
                            key={t.id}
                            className="flex items-center gap-2 cursor-pointer hover:bg-muted px-2 py-1 rounded"
                            onClick={() => {
                              const already = editDependencies.includes(t.id);
                              const newDeps = already
                                ? editDependencies.filter(id => id !== t.id)
                                : [...editDependencies, t.id];
                              setEditDependencies(newDeps);
                              if (typeof onDependenciesChange === 'function') {
                                onDependenciesChange(task.id, newDeps);
                              }
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={editDependencies.includes(t.id)}
                              readOnly
                            />
                            <span>{t.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                {/* Show selected dependencies as badges */}
                {editDependencies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editDependencies.map(depId => {
                      const depTask = (allTasks || []).find(t => t.id === depId);
                      if (!depTask) return null;
                      return (
                        <Badge key={depId} variant="secondary" className="flex items-center gap-1">
                          <span>{depTask.title}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 ml-1"
                            onClick={() => {
                              const newDeps = editDependencies.filter(id => id !== depId);
                              setEditDependencies(newDeps);
                              if (typeof onDependenciesChange === 'function') {
                                onDependenciesChange(task.id, newDeps);
                              }
                            }}
                          >
                            <span>×</span>
                          </Button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" variant="default">
                  Save
                </Button>
                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskItem; 