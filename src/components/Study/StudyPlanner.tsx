import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Target,
  CheckCircle2,
  Circle,
  Calendar,
  Trash2,
  RefreshCcw,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string;
}

interface StudyGoal {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
  createdAt: string;
  targetDate?: string;
  progress?: number;
}

const StudyPlanner: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [goalForm, setGoalForm] = useState({
    title: "",
    description: "",
    targetDate: "",
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);

  const fetchGoals = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/v1/study-planner?userId=${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Transform the API data to match our frontend model
        const transformedGoals: StudyGoal[] = data.map((item: any) => ({
          id: item._id,
          title: item.goalTitle,
          description: item.description || "",
          tasks: item.tasks.map((task: any) => ({
            id: task._id,
            title: task.title,
            description: task.description || "",
            completed: task.isCompleted,
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : undefined,
          })),
          createdAt: new Date(item.createdAt).toISOString().split("T")[0],
          targetDate: item.deadline ? new Date(item.deadline).toISOString().split("T")[0] : undefined,
          progress: item.progress || 0,
        }));
        setGoals(transformedGoals);
      } else {
        throw new Error("Failed to fetch study goals");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch study goals");
      console.error("Error fetching study goals:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const createGoal = async () => {
    if (!user?.id || !goalForm.title) return;

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/v1/study-planner", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          goalTitle: goalForm.title,
          description: goalForm.description,
          deadline: goalForm.targetDate || undefined,
        }),
      });

      if (response.ok) {
        setGoalForm({ title: "", description: "", targetDate: "" });
        setIsGoalDialogOpen(false);
        await fetchGoals();
      } else {
        throw new Error("Failed to create study goal");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create study goal");
      console.error("Error creating study goal:", err);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!taskForm.title || !selectedGoalId || !user?.id) return;

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/v1/study-planner/${selectedGoalId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: taskForm.title,
          description: taskForm.description,
          dueDate: taskForm.dueDate || undefined,
        }),
      });

      if (response.ok) {
        setTaskForm({ title: "", description: "", dueDate: "" });
        setIsTaskDialogOpen(false);
        await fetchGoals();
      } else {
        throw new Error("Failed to add task");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add task");
      console.error("Error adding task:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (goalId: string, taskId: string) => {
    if (!user?.id) return;
    
    const currentTask = goals
      .find(goal => goal.id === goalId)
      ?.tasks.find(task => task.id === taskId);
      
    if (!currentTask) return;
    
    const newCompletedStatus = !currentTask.completed;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/v1/study-planner/${goalId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId: taskId,
          isCompleted: newCompletedStatus,
        }),
      });

      if (response.ok) {
        // Update local state to reflect the change immediately
        setGoals(
          goals.map((goal) =>
            goal.id === goalId
              ? {
                  ...goal,
                  tasks: goal.tasks.map((task) =>
                    task.id === taskId
                      ? { ...task, completed: newCompletedStatus }
                      : task
                  ),
                }
              : goal
          )
        );
      } else {
        throw new Error("Failed to update task status");
      }
    } catch (err) {
      console.error("Error updating task status:", err);
      // Revert the optimistic update if the API call fails
      await fetchGoals();
    }
  };

  const deleteTask = async (goalId: string, taskId: string) => {
    if (!user?.id) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/v1/study-planner/${goalId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId: taskId,
        }),
      });

      if (response.ok) {
        // Update local state to reflect the deletion
        setGoals(
          goals.map((goal) =>
            goal.id === goalId
              ? { ...goal, tasks: goal.tasks.filter((task) => task.id !== taskId) }
              : goal
          )
        );
      } else {
        throw new Error("Failed to delete task");
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      await fetchGoals();
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!user?.id) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/v1/study-planner/${goalId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Update local state to reflect the deletion
        setGoals(goals.filter((goal) => goal.id !== goalId));
      } else {
        throw new Error("Failed to delete goal");
      }
    } catch (err) {
      console.error("Error deleting goal:", err);
      await fetchGoals();
    }
  };

  const getProgress = (goal: StudyGoal) => {
    if (goal.tasks.length === 0) return 0;
    const completedTasks = goal.tasks.filter((task) => task.completed).length;
    return (completedTasks / goal.tasks.length) * 100;
  };

  const [overallProgress, setOverallProgress] = useState(0);

  const fetchProgress = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/v1/study-planner/progress?userId=${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOverallProgress(data.progress);
      } else {
        // Fallback to client-side calculation if API fails
        calculateLocalProgress();
      }
    } catch (err) {
      console.error("Error fetching progress:", err);
      // Fallback to client-side calculation
      calculateLocalProgress();
    }
  }, [user?.id]);

  const calculateLocalProgress = () => {
    if (goals.length === 0) {
      setOverallProgress(0);
      return;
    }
    const totalProgress = goals.reduce(
      (sum, goal) => sum + getProgress(goal),
      0
    );
    setOverallProgress(totalProgress / goals.length);
  };

  const getOverallProgress = () => {
    return overallProgress;
  };

  const updateProgress = async (progressValue: number) => {
    if (!user?.id) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/v1/study-planner/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            progress: progressValue
          }),
        }
      );

      if (response.ok) {
        // Update local state to reflect the change
        setOverallProgress(progressValue);
        return true;
      } else {
        throw new Error("Failed to update progress");
      }
    } catch (err) {
      console.error("Error updating progress:", err);
      return false;
    }
  };
  
  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);
  
  // Update progress when goals change
  useEffect(() => {
    calculateLocalProgress();
  }, [goals]);
  

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {loading && !error && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Study Planner</h2>
          <p className="text-muted-foreground">
            Set goals and break them down into manageable tasks
          </p>
        </div>
        <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:scale-105 transition-all duration-300 shadow-glow">
              <Plus className="mr-2 h-4 w-4" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Study Goal</DialogTitle>
              <DialogDescription>
                Set a new learning objective and break it down into tasks
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="goal-title">Goal Title</Label>
                <Input
                  id="goal-title"
                  value={goalForm.title}
                  onChange={(e) =>
                    setGoalForm({ ...goalForm, title: e.target.value })
                  }
                  placeholder="e.g., Master Calculus"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="goal-desc">Description</Label>
                <Textarea
                  id="goal-desc"
                  value={goalForm.description}
                  onChange={(e) =>
                    setGoalForm({ ...goalForm, description: e.target.value })
                  }
                  placeholder="Describe what you want to achieve..."
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="target-date">Target Date (Optional)</Label>
                <Input
                  id="target-date"
                  type="date"
                  value={goalForm.targetDate}
                  onChange={(e) =>
                    setGoalForm({ ...goalForm, targetDate: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={createGoal}
                className="bg-gradient-primary hover:scale-105 transition-all duration-300"
              >
                Create Goal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overall Progress */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <span>Overall Progress</span>
              </CardTitle>
              <CardDescription>Your study goals progress overview</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="hover:scale-105 transition-all duration-200"
                  >
                    Update Progress
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Update Progress</DialogTitle>
                    <DialogDescription>
                      Manually set your overall study progress
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="progress-value">Progress Value (%)</Label>
                      <div className="flex items-center space-x-4">
                        <Input
                          id="progress-value"
                          type="number"
                          min="0"
                          max="100"
                          value={overallProgress.toFixed(0)}
                          onChange={(e) => {
                            const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                            setOverallProgress(value);
                          }}
                          className="w-24"
                        />
                        <Progress value={overallProgress} className="flex-1 h-2" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => updateProgress(overallProgress)}
                      className="bg-gradient-primary hover:scale-105 transition-all duration-300"
                    >
                      Save Progress
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchProgress}
                className="hover:scale-105 transition-all duration-200"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completion Rate</span>
              <span className="text-2xl font-bold text-foreground">
                {getOverallProgress().toFixed(0)}%
              </span>
            </div>
            <Progress value={getOverallProgress()} className="w-full h-3" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">
                  {goals.length}
                </p>
                <p className="text-xs text-muted-foreground">Total Goals</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-success">
                  {goals.reduce(
                    (sum, goal) =>
                      sum + goal.tasks.filter((t) => t.completed).length,
                    0
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Completed Tasks</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-warning">
                  {goals.reduce(
                    (sum, goal) =>
                      sum + goal.tasks.filter((t) => !t.completed).length,
                    0
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Remaining Tasks</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <Card className="bg-gradient-card shadow-card">
            <CardContent className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Study Goals Yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Create your first study goal to start planning your learning
                journey.
              </p>
              <Button
                onClick={() => setIsGoalDialogOpen(true)}
                className="bg-gradient-primary hover:scale-105 transition-all duration-300"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          goals.map((goal) => (
            <Card
              key={goal.id}
              className="bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center space-x-2 mb-2">
                      <Target className="h-5 w-5 text-primary" />
                      <span>{goal.title}</span>
                    </CardTitle>
                    <CardDescription className="mb-3">
                      {goal.description}
                    </CardDescription>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>
                        Created: {new Date(goal.createdAt).toLocaleDateString()}
                      </span>
                      {goal.targetDate && (
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Due:{" "}
                            {new Date(goal.targetDate).toLocaleDateString()}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedGoalId(goal.id);
                        setIsTaskDialogOpen(true);
                      }}
                      className="hover:scale-110 transition-all duration-200"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteGoal(goal.id)}
                      className="hover:bg-destructive/10 hover:text-destructive hover:scale-110 transition-all duration-200"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Progress</span>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-6 px-2 hover:scale-105 transition-all duration-200"
                            >
                              Update
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Update Goal Progress</DialogTitle>
                              <DialogDescription>
                                Manually set progress for "{goal.title}"
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor={`progress-value-${goal.id}`}>Progress Value (%)</Label>
                                <div className="flex items-center space-x-4">
                                  <Input
                                    id={`progress-value-${goal.id}`}
                                    type="number"
                                    min="0"
                                    max="100"
                                    defaultValue={(goal.progress || getProgress(goal)).toFixed(0)}
                                    className="w-24"
                                  />
                                  <Progress value={goal.progress || getProgress(goal)} className="flex-1 h-2" />
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={async () => {
                                  const input = document.getElementById(`progress-value-${goal.id}`) as HTMLInputElement;
                                  const value = Math.min(100, Math.max(0, parseInt(input.value) || 0));
                                  
                                  try {
                                    const token = localStorage.getItem("token");
                                    const response = await fetch(
                                      `http://localhost:5000/api/v1/study-planner/${goal.id}`,
                                      {
                                        method: "PATCH",
                                        headers: {
                                          Authorization: `Bearer ${token}`,
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          progress: value
                                        }),
                                      }
                                    );
                                    
                                    if (response.ok) {
                                      // Update the goal's progress
                                      const updatedGoals = goals.map(g => 
                                        g.id === goal.id ? {...g, progress: value} : g
                                      );
                                      setGoals(updatedGoals);
                                      
                                      // Calculate new overall progress
                                      const totalProgress = updatedGoals.reduce(
                                        (sum, g) => sum + (g.progress !== undefined ? g.progress : getProgress(g)),
                                        0
                                      );
                                      setOverallProgress(totalProgress / updatedGoals.length);
                                    } else {
                                      throw new Error("Failed to update goal progress");
                                    }
                                  } catch (err) {
                                    console.error("Error updating goal progress:", err);
                                    setError(err instanceof Error ? err.message : "Failed to update goal progress");
                                  }
                                }}
                                className="bg-gradient-primary hover:scale-105 transition-all duration-300"
                              >
                                Save Progress
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <span className="text-sm font-medium">
                          {(goal.progress !== undefined ? goal.progress : getProgress(goal)).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={goal.progress !== undefined ? goal.progress : getProgress(goal)}
                      className="w-full h-2"
                    />
                  </div>

                  {/* Tasks */}
                  <div className="space-y-2">
                    {goal.tasks.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No tasks yet. Add some tasks to get started!
                      </p>
                    ) : (
                      goal.tasks.map((task) => (
                        <div
                          key={task.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                            task.completed
                              ? "bg-success/5 border-success/20"
                              : "bg-secondary/20 hover:bg-secondary/30"
                          }`}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTask(goal.id, task.id)}
                            className="p-0 hover:scale-110 transition-all duration-200"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-success" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                          </Button>
                          <div className="flex-1">
                            <h4
                              className={`font-medium ${
                                task.completed
                                  ? "line-through text-muted-foreground"
                                  : "text-foreground"
                              }`}
                            >
                              {task.title}
                            </h4>
                            {task.description && (
                              <p
                                className={`text-sm ${
                                  task.completed
                                    ? "line-through text-muted-foreground"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {task.description}
                              </p>
                            )}
                            {task.dueDate && (
                              <p className="text-xs text-muted-foreground mt-1 flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  Due:{" "}
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTask(goal.id, task.id)}
                            className="hover:bg-destructive/10 hover:text-destructive hover:scale-110 transition-all duration-200"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
            <DialogDescription>
              Break down your goal into a specific, actionable task
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                value={taskForm.title}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, title: e.target.value })
                }
                placeholder="e.g., Review derivatives"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-desc">Description</Label>
              <Textarea
                id="task-desc"
                value={taskForm.description}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, description: e.target.value })
                }
                placeholder="What needs to be done..."
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="due-date">Due Date (Optional)</Label>
              <Input
                id="due-date"
                type="date"
                value={taskForm.dueDate}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, dueDate: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={addTask}
              className="bg-gradient-primary hover:scale-105 transition-all duration-300"
            >
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudyPlanner;
