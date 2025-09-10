import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Target, CheckCircle2, Circle, Calendar, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

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
}

const StudyPlanner: React.FC = () => {
  const [goals, setGoals] = useState<StudyGoal[]>([
    {
      id: '1',
      title: 'Master Calculus',
      description: 'Complete all calculus topics before midterm exam',
      tasks: [
        { id: 't1', title: 'Review derivatives', description: 'Practice basic derivative rules', completed: true },
        { id: 't2', title: 'Study integrals', description: 'Learn integration techniques', completed: true },
        { id: 't3', title: 'Practice word problems', description: 'Solve real-world applications', completed: false },
        { id: 't4', title: 'Take practice test', description: 'Complete mock exam', completed: false }
      ],
      createdAt: '2024-01-10',
      targetDate: '2024-02-15'
    }
  ]);

  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    targetDate: ''
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: ''
  });

  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);

  const createGoal = () => {
    if (!goalForm.title) return;

    const newGoal: StudyGoal = {
      id: uuidv4(),
      title: goalForm.title,
      description: goalForm.description,
      tasks: [],
      createdAt: new Date().toISOString().split('T')[0],
      targetDate: goalForm.targetDate || undefined
    };

    setGoals([...goals, newGoal]);
    setGoalForm({ title: '', description: '', targetDate: '' });
    setIsGoalDialogOpen(false);
  };

  const addTask = () => {
    if (!taskForm.title || !selectedGoalId) return;

    const newTask: Task = {
      id: uuidv4(),
      title: taskForm.title,
      description: taskForm.description,
      completed: false,
      dueDate: taskForm.dueDate || undefined
    };

    setGoals(goals.map(goal => 
      goal.id === selectedGoalId 
        ? { ...goal, tasks: [...goal.tasks, newTask] }
        : goal
    ));

    setTaskForm({ title: '', description: '', dueDate: '' });
    setIsTaskDialogOpen(false);
  };

  const toggleTask = (goalId: string, taskId: string) => {
    setGoals(goals.map(goal => 
      goal.id === goalId 
        ? {
            ...goal,
            tasks: goal.tasks.map(task => 
              task.id === taskId 
                ? { ...task, completed: !task.completed }
                : task
            )
          }
        : goal
    ));
  };

  const deleteTask = (goalId: string, taskId: string) => {
    setGoals(goals.map(goal => 
      goal.id === goalId 
        ? { ...goal, tasks: goal.tasks.filter(task => task.id !== taskId) }
        : goal
    ));
  };

  const deleteGoal = (goalId: string) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
  };

  const getProgress = (goal: StudyGoal) => {
    if (goal.tasks.length === 0) return 0;
    const completedTasks = goal.tasks.filter(task => task.completed).length;
    return (completedTasks / goal.tasks.length) * 100;
  };

  const getOverallProgress = () => {
    if (goals.length === 0) return 0;
    const totalProgress = goals.reduce((sum, goal) => sum + getProgress(goal), 0);
    return totalProgress / goals.length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Study Planner</h2>
          <p className="text-muted-foreground">Set goals and break them down into manageable tasks</p>
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
                  onChange={(e) => setGoalForm({...goalForm, title: e.target.value})}
                  placeholder="e.g., Master Calculus"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="goal-desc">Description</Label>
                <Textarea
                  id="goal-desc"
                  value={goalForm.description}
                  onChange={(e) => setGoalForm({...goalForm, description: e.target.value})}
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
                  onChange={(e) => setGoalForm({...goalForm, targetDate: e.target.value})}
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
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <span>Overall Progress</span>
          </CardTitle>
          <CardDescription>Your study goals progress overview</CardDescription>
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
                <p className="text-2xl font-bold text-primary">{goals.length}</p>
                <p className="text-xs text-muted-foreground">Total Goals</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-success">
                  {goals.reduce((sum, goal) => sum + goal.tasks.filter(t => t.completed).length, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Completed Tasks</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-warning">
                  {goals.reduce((sum, goal) => sum + goal.tasks.filter(t => !t.completed).length, 0)}
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
              <h3 className="text-lg font-semibold text-foreground mb-2">No Study Goals Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first study goal to start planning your learning journey.
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
          goals.map(goal => (
            <Card key={goal.id} className="bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center space-x-2 mb-2">
                      <Target className="h-5 w-5 text-primary" />
                      <span>{goal.title}</span>
                    </CardTitle>
                    <CardDescription className="mb-3">{goal.description}</CardDescription>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Created: {new Date(goal.createdAt).toLocaleDateString()}</span>
                      {goal.targetDate && (
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Due: {new Date(goal.targetDate).toLocaleDateString()}</span>
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
                      <span className="text-sm font-medium">{getProgress(goal).toFixed(0)}%</span>
                    </div>
                    <Progress value={getProgress(goal)} className="w-full h-2" />
                  </div>

                  {/* Tasks */}
                  <div className="space-y-2">
                    {goal.tasks.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No tasks yet. Add some tasks to get started!
                      </p>
                    ) : (
                      goal.tasks.map(task => (
                        <div
                          key={task.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                            task.completed 
                              ? 'bg-success/5 border-success/20' 
                              : 'bg-secondary/20 hover:bg-secondary/30'
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
                            <h4 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                                {task.description}
                              </p>
                            )}
                            {task.dueDate && (
                              <p className="text-xs text-muted-foreground mt-1 flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
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
                onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                placeholder="e.g., Review derivatives"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-desc">Description</Label>
              <Textarea
                id="task-desc"
                value={taskForm.description}
                onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
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
                onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
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