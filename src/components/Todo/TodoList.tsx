import React, { useState, useEffect, useCallback } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Flag,
  Trash2,
  Edit,
  Clock,
  Target,
  AlertCircle,
  Filter,
  SortAsc,
  Sparkles,
  PlayCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface TodoItem {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  priority: "Low" | "Medium" | "High";
  category?: string;
  dueDate?: string;
  status: "pending" | "in-progress" | "completed";
  createdAt: string;
}

const TodoList: React.FC = () => {
  const { user } = useAuth();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium" as TodoItem["priority"],
    category: "",
    dueDate: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<TodoItem | null>(null);
  const [filter, setFilter] = useState<
    "all" | "pending" | "in-progress" | "completed"
  >("all");
  const [sortBy, setSortBy] = useState<"created" | "priority" | "dueDate">(
    "created"
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const categories = [
    {
      value: "personal",
      label: "Personal",
      icon: "👤",
      color: "bg-blue-100 text-blue-700",
    },
    {
      value: "academic",
      label: "Academic",
      icon: "📚",
      color: "bg-purple-100 text-purple-700",
    },
    {
      value: "work",
      label: "Work",
      icon: "💼",
      color: "bg-green-100 text-green-700",
    },
    {
      value: "health",
      label: "Health",
      icon: "💪",
      color: "bg-red-100 text-red-700",
    },
    {
      value: "shopping",
      label: "Shopping",
      icon: "�️",
      color: "bg-warning/10 text-warning",
    },
    {
      value: "other",
      label: "Other",
      icon: "�}",
      color: "bg-muted/50 text-muted-foreground",
    },
  ];

  const priorities = [
    {
      value: "Low",
      label: "Low",
      color: "bg-success/10 text-success border-success/20",
      icon: "🟢",
    },
    {
      value: "Medium",
      label: "Medium",
      color: "bg-warning/10 text-warning border-warning/20",
      icon: "🟡",
    },
    {
      value: "High",
      label: "High",
      color: "bg-destructive/10 text-destructive border-destructive/20",
      icon: "🔴",
    },
  ];

  const statusConfig = [
    {
      value: "pending",
      label: "Pending",
      icon: Circle,
      color: "text-muted-foreground",
    },
    {
      value: "in-progress",
      label: "In Progress",
      icon: PlayCircle,
      color: "text-primary",
    },
    {
      value: "completed",
      label: "Completed",
      icon: CheckCircle,
      color: "text-success",
    },
  ];

  // API Functions
  const fetchTodos = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://student-zenith-backend-msh7.vercel.app/api/v1/todo?userId=${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTodos(Array.isArray(data) ? data : []);
      } else {
        throw new Error("Failed to fetch todos");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch todos");
      console.error("Error fetching todos:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchTodoById = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://student-zenith-backend-msh7.vercel.app/api/v1/todo/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const todo = await response.json();
        setSelectedTodo(todo);
        setIsViewDialogOpen(true);
      }
    } catch (err) {
      console.error("Error fetching todo:", err);
    }
  };

  const fetchTodosByCategory = async (category: string) => {
    if (!user?.id) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://student-zenith-backend-msh7.vercel.app/api/v1/todo/category/${category}?userId=${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTodos(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching todos by category:", err);
    }
  };

  const createTodo = async () => {
    if (!user?.id || !formData.title) return;

    setCreating(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://student-zenith-backend-msh7.vercel.app/api/v1/todo",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            title: formData.title,
            description: formData.description || undefined,
            priority: formData.priority,
            category: formData.category || undefined,
            dueDate: formData.dueDate || undefined,
          }),
        }
      );

      if (response.ok) {
        setFormData({
          title: "",
          description: "",
          priority: "Medium",
          category: "",
          dueDate: "",
        });
        setIsDialogOpen(false);
        await fetchTodos();
      } else {
        throw new Error("Failed to create todo");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create todo");
    } finally {
      setCreating(false);
    }
  };

  const updateTodo = async () => {
    if (!editingId || !formData.title) return;

    setCreating(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://student-zenith-backend-msh7.vercel.app/api/v1/todo/${editingId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description || undefined,
            priority: formData.priority,
            category: formData.category || undefined,
            dueDate: formData.dueDate || undefined,
          }),
        }
      );

      if (response.ok) {
        setFormData({
          title: "",
          description: "",
          priority: "Medium",
          category: "",
          dueDate: "",
        });
        setEditingId(null);
        setIsDialogOpen(false);
        await fetchTodos();
      } else {
        throw new Error("Failed to update todo");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update todo");
    } finally {
      setCreating(false);
    }
  };

  const updateTodoStatus = async (id: string, status: TodoItem["status"]) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://student-zenith-backend-msh7.vercel.app/api/v1/todo/${id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (response.ok) {
        await fetchTodos();
      }
    } catch (err) {
      console.error("Error updating todo status:", err);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://student-zenith-backend-msh7.vercel.app/api/v1/todo/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await fetchTodos();
      } else {
        throw new Error("Failed to delete todo");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete todo");
    }
  };

  // Event handlers
  const handleEdit = (todo: TodoItem) => {
    setFormData({
      title: todo.title,
      description: todo.description || "",
      priority: todo.priority,
      category: todo.category || "",
      dueDate: todo.dueDate
        ? new Date(todo.dueDate).toISOString().split("T")[0]
        : "",
    });
    setEditingId(todo._id);
    setIsDialogOpen(true);
  };

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category);
    if (category === "all") {
      fetchTodos();
    } else {
      fetchTodosByCategory(category);
    }
  };

  const getNextStatus = (
    currentStatus: TodoItem["status"]
  ): TodoItem["status"] => {
    switch (currentStatus) {
      case "pending":
        return "in-progress";
      case "in-progress":
        return "completed";
      case "completed":
        return "pending";
      default:
        return "pending";
    }
  };

  // Filter and sort todos
  const getFilteredTodos = () => {
    let filtered = todos;

    if (filter !== "all") {
      filtered = todos.filter((todo) => todo.status === filter);
    }
    const priorityOrder = { High: 3, Medium: 2, Low: 1 };
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "priority":
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case "dueDate":
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });
  };

  const getStats = () => {
    const total = todos.length;
    const completed = todos.filter(
      (todo) => todo.status === "completed"
    ).length;
    const inProgress = todos.filter(
      (todo) => todo.status === "in-progress"
    ).length;
    const pending = todos.filter((todo) => todo.status === "pending").length;
    const overdue = todos.filter(
      (todo) =>
        todo.status !== "completed" &&
        todo.dueDate &&
        new Date(todo.dueDate) < new Date()
    ).length;

    return { total, completed, inProgress, pending, overdue };
  };

  const isOverdue = (todo: TodoItem) => {
    return (
      todo.status !== "completed" &&
      todo.dueDate &&
      new Date(todo.dueDate) < new Date()
    );
  };

  useEffect(() => {
    if (user?.id) {
      fetchTodos();
    }
  }, [user?.id, fetchTodos]);

  const stats = getStats();
  const filteredTodos = getFilteredTodos();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl">
                <Target className="h-8 w-8 text-white" />
              </div>
              Task Manager
            </h1>
            <p className="text-gray-600 mt-3 text-lg">
              Stay organized and boost your productivity ({todos.length} tasks)
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Sparkles className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-indigo-500" />
                  {editingId ? "Edit Task" : "Create New Task"}
                </DialogTitle>
                <DialogDescription>
                  {editingId
                    ? "Update your task details"
                    : "Add a new task to stay organized and productive"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="What needs to be done?"
                    className="border-2 focus:border-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Add more details about this task..."
                    rows={3}
                    className="border-2 focus:border-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: TodoItem["priority"]) =>
                        setFormData({ ...formData, priority: value })
                      }
                    >
                      <SelectTrigger className="border-2 focus:border-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem
                            key={priority.value}
                            value={priority.value}
                          >
                            <div className="flex items-center gap-2">
                              <span>{priority.icon}</span>
                              <span>{priority.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger className="border-2 focus:border-indigo-500">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              <span>{cat.icon}</span>
                              <span>{cat.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    className="border-2 focus:border-indigo-500"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingId(null);
                    setFormData({
                      title: "",
                      description: "",
                      priority: "Medium",
                      category: "",
                      dueDate: "",
                    });
                  }}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={editingId ? updateTodo : createTodo}
                  disabled={creating || !formData.title}
                  className="bg-gradient-to-r from-primary to-primary/70 hover:from-primary/90 hover:to-primary/60"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingId ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      {editingId ? "Update" : "Create"} Task
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Target className="h-6 w-6 text-indigo-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-muted to-muted-foreground/70 text-muted-foreground border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted/90 text-sm">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
                <Circle className="h-6 w-6 text-muted/70" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-primary to-primary-foreground/70 text-primary-foreground border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-foreground/90 text-sm">
                    In Progress
                  </p>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                </div>
                <PlayCircle className="h-6 w-6 text-primary-foreground/70" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-success to-success/70 text-success-foreground border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-success-foreground/90 text-sm">
                    Completed
                  </p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
                <CheckCircle2 className="h-6 w-6 text-success-foreground/70" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-destructive to-destructive/70 text-destructive-foreground border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-destructive-foreground/90 text-sm">
                    Overdue
                  </p>
                  <p className="text-2xl font-bold">{stats.overdue}</p>
                </div>
                <Flag className="h-6 w-6 text-destructive-foreground/70" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-600" />
                <Label className="font-medium">Status:</Label>
                <Select
                  value={filter}
                  onValueChange={(value: typeof filter) => setFilter(value)}
                >
                  <SelectTrigger className="w-40 border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tasks</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <SortAsc className="h-4 w-4 text-gray-600" />
                <Label className="font-medium">Sort by:</Label>
                <Select
                  value={sortBy}
                  onValueChange={(value: typeof sortBy) => setSortBy(value)}
                >
                  <SelectTrigger className="w-40 border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created">Created Date</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="dueDate">Due Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-gray-600" />
                <Label className="font-medium">Category:</Label>
                <Select
                  value={categoryFilter}
                  onValueChange={handleCategoryFilter}
                >
                  <SelectTrigger className="w-40 border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading your tasks...</p>
            </div>
          ) : filteredTodos.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="text-center py-16">
                <div className="bg-gradient-to-r from-indigo-100 to-cyan-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Target className="h-12 w-12 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {filter === "all" ? "No tasks yet" : `No ${filter} tasks`}
                </h3>
                <p className="text-gray-600 mb-6 text-lg max-w-md mx-auto">
                  {filter === "all"
                    ? "Create your first task to get started on your productivity journey!"
                    : `You have no ${filter} tasks at the moment.`}
                </p>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-gradient-to-r from-primary to-primary/70 hover:from-primary/90 hover:to-primary/60 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  size="lg"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Create Your First Task
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredTodos.map((todo, index) => {
              const category = categories.find(
                (cat) => cat.value === todo.category
              );
              const priority = priorities.find(
                (p) => p.value === todo.priority
              );
              const statusInfo = statusConfig.find(
                (s) => s.value === todo.status
              );
              const StatusIcon = statusInfo?.icon || Circle;

              return (
                <Card
                  key={todo._id}
                  className={`group bg-card/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                    isOverdue(todo)
                      ? "ring-2 ring-destructive/20 bg-destructive/5"
                      : ""
                  } ${todo.status === "completed" ? "opacity-75" : ""}`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: "fadeInUp 0.5s ease-out forwards",
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          updateTodoStatus(todo._id, getNextStatus(todo.status))
                        }
                        className="p-2 hover:scale-110 transition-all duration-200 mt-1"
                      >
                        <StatusIcon
                          className={`h-6 w-6 ${statusInfo?.color}`}
                        />
                      </Button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4
                              className={`text-lg font-semibold ${
                                todo.status === "completed"
                                  ? "line-through text-gray-500"
                                  : "text-gray-900"
                              } group-hover:text-indigo-600 transition-colors`}
                            >
                              {todo.title}
                            </h4>
                            {todo.description && (
                              <p
                                className={`text-sm mt-2 ${
                                  todo.status === "completed"
                                    ? "line-through text-gray-400"
                                    : "text-gray-600"
                                }`}
                              >
                                {todo.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => fetchTodoById(todo._id)}
                              className="opacity-0 group-hover:opacity-100 hover:scale-110 transition-all duration-200"
                            >
                              <CheckCircle className="h-4 w-4 text-primary" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(todo)}
                              className="opacity-0 group-hover:opacity-100 hover:scale-110 transition-all duration-200"
                            >
                              <Edit className="h-4 w-4 text-primary" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTodo(todo._id)}
                              className="opacity-0 group-hover:opacity-100 hover:scale-110 transition-all duration-200 hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <Badge
                            className={`${priority?.color} border-0 font-medium`}
                          >
                            <span className="mr-1">{priority?.icon}</span>
                            {priority?.label}
                          </Badge>

                          {category && (
                            <Badge
                              className={`${category.color} border-0 font-medium`}
                            >
                              <span className="mr-1">{category.icon}</span>
                              {category.label}
                            </Badge>
                          )}

                          <Badge variant="outline" className="font-medium">
                            <StatusIcon
                              className={`h-3 w-3 mr-1 ${statusInfo?.color}`}
                            />
                            {statusInfo?.label}
                          </Badge>

                          {todo.dueDate && (
                            <Badge
                              className={`font-medium border-0 ${
                                isOverdue(todo)
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(todo.dueDate).toLocaleDateString()}
                            </Badge>
                          )}

                          <Badge variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(todo.createdAt).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* View Todo Modal */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-r from-primary to-primary/70 rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                {selectedTodo?.title}
              </DialogTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Created{" "}
                  {selectedTodo &&
                    new Date(selectedTodo.createdAt).toLocaleDateString()}
                </div>
                {selectedTodo && (
                  <Badge
                    className={
                      priorities.find((p) => p.value === selectedTodo.priority)
                        ?.color
                    }
                  >
                    {selectedTodo.priority} Priority
                  </Badge>
                )}
              </div>
            </DialogHeader>

            {selectedTodo && (
              <div className="space-y-4 mt-6">
                {selectedTodo.description && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">
                      Description
                    </h4>
                    <p className="text-muted-foreground bg-muted/50 p-4 rounded-lg">
                      {selectedTodo.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Status</h4>
                    <Badge className="bg-primary/10 text-primary">
                      {
                        statusConfig.find(
                          (s) => s.value === selectedTodo.status
                        )?.label
                      }
                    </Badge>
                  </div>

                  {selectedTodo.category && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Category
                      </h4>
                      <Badge
                        className={
                          categories.find(
                            (c) => c.value === selectedTodo.category
                          )?.color
                        }
                      >
                        {
                          categories.find(
                            (c) => c.value === selectedTodo.category
                          )?.label
                        }
                      </Badge>
                    </div>
                  )}
                </div>

                {selectedTodo.dueDate && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Due Date</h4>
                    <Badge
                      className={
                        isOverdue(selectedTodo)
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(selectedTodo.dueDate).toLocaleDateString()}
                    </Badge>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => setIsViewDialogOpen(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setIsViewDialogOpen(false);
                  if (selectedTodo) handleEdit(selectedTodo);
                }}
                className="bg-gradient-to-r from-primary to-primary/70 hover:from-primary/90 hover:to-primary/60"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default TodoList;
