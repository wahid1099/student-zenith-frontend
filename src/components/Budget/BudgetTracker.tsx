import React, { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  PieChart,
  BarChart3,
  AlertTriangle,
  Repeat,
  Target,
  Edit,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { v4 as uuidv4 } from "uuid";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Expense {
  id: string;
  amount: number;
  category: "food" | "transport" | "study" | "fun" | "other";
  description: string;
  date: string;
}

const BudgetTracker: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: "1",
      amount: 15.5,
      category: "food",
      description: "Lunch at cafeteria",
      date: "2024-01-15",
    },
    {
      id: "2",
      amount: 5.0,
      category: "transport",
      description: "Bus fare",
      date: "2024-01-15",
    },
    {
      id: "3",
      amount: 25.0,
      category: "study",
      description: "Textbook",
      date: "2024-01-14",
    },
  ]);

  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const categories = [
    { value: "food", label: "Food", icon: "🍔" },
    { value: "transport", label: "Transport", icon: "🚌" },
    { value: "study", label: "Study", icon: "📚" },
    { value: "fun", label: "Fun", icon: "🎯" },
    { value: "other", label: "Other", icon: "💡" },
  ];

  const handleSubmit = () => {
    if (!formData.amount || !formData.category || !formData.description) return;

    const newExpense: Expense = {
      id: uuidv4(),
      amount: parseFloat(formData.amount),
      category: formData.category as Expense["category"],
      description: formData.description,
      date: formData.date,
    };

    setExpenses([...expenses, newExpense]);
    setFormData({
      amount: "",
      category: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
    setIsDialogOpen(false);
  };

  const getCategoryTotal = (category: string) => {
    return expenses
      .filter((expense) => expense.category === category)
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getCategoryData = () => {
    const categoryTotals = categories.map((cat) => ({
      label: cat.label,
      value: getCategoryTotal(cat.value),
      color: `hsl(var(--category-${cat.value}))`,
    }));

    return {
      labels: categoryTotals.map((item) => item.label),
      datasets: [
        {
          label: "Expenses ($)",
          data: categoryTotals.map((item) => item.value),
          backgroundColor: categoryTotals.map((item) => item.color),
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "hsl(var(--border))",
        },
        ticks: {
          color: "hsl(var(--muted-foreground))",
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "hsl(var(--muted-foreground))",
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Budget Tracker</h2>
          <p className="text-muted-foreground">
            Track your daily expenses and spending habits
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:scale-105 transition-all duration-300 shadow-glow">
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
              <DialogDescription>
                Record a new expense to track your spending
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <span className="flex items-center space-x-2">
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="What did you spend on?"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleSubmit}
                className="bg-gradient-primary hover:scale-105 transition-all duration-300"
              >
                Add Expense
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${getTotalExpenses().toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              +${getTotalExpenses().toFixed(2)} from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Daily Spend
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              $
              {(
                getTotalExpenses() /
                Math.max(1, new Set(expenses.map((e) => e.date)).size)
              ).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on {new Set(expenses.map((e) => e.date)).size} days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {categories.find(
                (cat) =>
                  getCategoryTotal(cat.value) ===
                  Math.max(...categories.map((c) => getCategoryTotal(c.value)))
              )?.label || "None"}
            </div>
            <p className="text-xs text-muted-foreground">
              Highest spending category
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
          <CardDescription>Your spending by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Bar data={getCategoryData()} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>Your latest spending activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {expenses
              .slice(-5)
              .reverse()
              .map((expense) => {
                const category = categories.find(
                  (cat) => cat.value === expense.category
                );
                return (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg hover:bg-secondary/30 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                        style={{
                          backgroundColor: `hsl(var(--category-${expense.category}) / 0.2)`,
                        }}
                      >
                        {category?.icon}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {expense.description}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {category?.label} •{" "}
                          {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        ${expense.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetTracker;
