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
  Trash2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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

interface Transaction {
  _id: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  note: string;
  date: string;
  isRecurring?: boolean;
  recurringFrequency?: "daily" | "weekly" | "monthly" | "yearly";
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  month: string;
  userId: string;
}

interface Summary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  categoryBreakdown: { [key: string]: number };
  monthlyTrends: { month: string; income: number; expenses: number }[];
}

const EnhancedBudgetTracker: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    categoryBreakdown: {},
    monthlyTrends: [],
  });
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [activeTab, setActiveTab] = useState("overview");
  const [alerts, setAlerts] = useState<string[]>([]);

  // Form states
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [transactionForm, setTransactionForm] = useState({
    amount: "",
    type: "expense" as "income" | "expense",
    category: "",
    note: "",
    date: new Date().toISOString().split("T")[0],
    isRecurring: false,
    recurringFrequency: "monthly" as "daily" | "weekly" | "monthly" | "yearly",
  });
  const [budgetForm, setBudgetForm] = useState({
    category: "",
    limit: "",
    month: new Date().toISOString().slice(0, 7),
  });

  const categories = {
    expense: [
      { value: "food", label: "Food & Dining", icon: "🍔", color: "#FF6384" },
      { value: "transport", label: "Transport", icon: "🚌", color: "#36A2EB" },
      { value: "study", label: "Education", icon: "📚", color: "#FFCE56" },
      {
        value: "entertainment",
        label: "Entertainment",
        icon: "🎯",
        color: "#4BC0C0",
      },
      { value: "shopping", label: "Shopping", icon: "🛍️", color: "#9966FF" },
      { value: "health", label: "Health", icon: "🏥", color: "#FF9F40" },
      { value: "rent", label: "Rent & Bills", icon: "🏠", color: "#FF6384" },
      { value: "other", label: "Other", icon: "💡", color: "#C9CBCF" },
    ],
    income: [
      { value: "salary", label: "Salary", icon: "💼", color: "#4BC0C0" },
      { value: "freelance", label: "Freelance", icon: "💻", color: "#36A2EB" },
      { value: "allowance", label: "Allowance", icon: "👨‍👩‍👧‍👦", color: "#FFCE56" },
      {
        value: "scholarship",
        label: "Scholarship",
        icon: "🎓",
        color: "#9966FF",
      },
      {
        value: "investment",
        label: "Investment",
        icon: "📈",
        color: "#FF9F40",
      },
      { value: "other", label: "Other", icon: "💰", color: "#4BC0C0" },
    ],
  };

  // Helper function for budget alerts
  const checkBudgetAlerts = useCallback(
    (summaryData: Summary) => {
      if (!summaryData || !summaryData.categoryBreakdown) return;

      const newAlerts: string[] = [];
      budgets.forEach((budget) => {
        const spent = summaryData.categoryBreakdown[budget.category] || 0;
        const limit = budget.limit || 0;

        if (
          typeof spent === "number" &&
          typeof limit === "number" &&
          limit > 0
        ) {
          if (spent > limit) {
            newAlerts.push(
              `Budget exceeded for ${budget.category}: $${spent.toFixed(
                2
              )} / $${limit.toFixed(2)}`
            );
          } else if (spent > limit * 0.8) {
            newAlerts.push(
              `Budget warning for ${budget.category}: $${spent.toFixed(
                2
              )} / $${limit.toFixed(2)} (80% used)`
            );
          }
        }
      });
      setAlerts(newAlerts);
    },
    [budgets]
  );

  // Calculate summary from transactions
  const calculateSummary = useCallback(
    (transactionList: Transaction[]) => {
      let totalIncome = 0;
      let totalExpenses = 0;
      const categoryBreakdown: { [key: string]: number } = {};

      transactionList.forEach((transaction) => {
        const amount = transaction.amount || 0;

        if (transaction.type === "income") {
          totalIncome += amount;
        } else if (transaction.type === "expense") {
          totalExpenses += amount;
          categoryBreakdown[transaction.category] =
            (categoryBreakdown[transaction.category] || 0) + amount;
        }
      });

      const balance = totalIncome - totalExpenses;

      // Create monthly trends (simplified - you can enhance this)
      const monthlyTrends = [
        {
          month: new Date().toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
          income: totalIncome,
          expenses: totalExpenses,
        },
      ];

      const summaryData: Summary = {
        totalIncome,
        totalExpenses,
        balance,
        categoryBreakdown,
        monthlyTrends,
      };

      setSummary(summaryData);
      checkBudgetAlerts(summaryData);
    },
    [checkBudgetAlerts]
  );

  // API Functions
  const fetchTransactions = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/v1/budget?userId=${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        const transactionList = Array.isArray(data) ? data : [];
        setTransactions(transactionList);
        // Calculate summary from transactions
        calculateSummary(transactionList);
      } else {
        console.error("Failed to fetch transactions:", response.statusText);
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, calculateSummary]);

  const fetchSummary = useCallback(async () => {
    if (!user?.id) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/v1/budget/summary?userId=${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();

        // Ensure data has proper structure with default values
        const summaryData: Summary = {
          totalIncome:
            typeof data.totalIncome === "number" ? data.totalIncome : 0,
          totalExpenses:
            typeof data.totalExpenses === "number" ? data.totalExpenses : 0,
          balance: typeof data.balance === "number" ? data.balance : 0,
          categoryBreakdown:
            data.categoryBreakdown && typeof data.categoryBreakdown === "object"
              ? data.categoryBreakdown
              : {},
          monthlyTrends: Array.isArray(data.monthlyTrends)
            ? data.monthlyTrends
            : [],
        };

        setSummary(summaryData);
        checkBudgetAlerts(summaryData);
      } else {
        console.error("Failed to fetch summary, using calculated summary");
        // Fallback: calculate from current transactions
        calculateSummary(transactions);
      }
    } catch (error) {
      console.error("Error fetching summary, using calculated summary:", error);
      // Fallback: calculate from current transactions
      calculateSummary(transactions);
    }
  }, [user?.id, checkBudgetAlerts, calculateSummary, transactions]);

  const addTransaction = async () => {
    if (!user?.id || !transactionForm.amount || !transactionForm.category)
      return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/v1/budget", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: transactionForm.type,
          amount: parseFloat(transactionForm.amount),
          category: transactionForm.category,
          note: transactionForm.note,
          date: transactionForm.date,
          isRecurring: transactionForm.isRecurring,
          recurringFrequency: transactionForm.recurringFrequency,
          userId: user.id,
        }),
      });

      if (response.ok) {
        setTransactionForm({
          amount: "",
          type: "expense",
          category: "",
          note: "",
          date: new Date().toISOString().split("T")[0],
          isRecurring: false,
          recurringFrequency: "monthly",
        });
        setIsTransactionDialogOpen(false);
        await fetchTransactions(); // This will also calculate summary
      } else {
        console.error("Failed to add transaction:", response.statusText);
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/v1/budget/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        fetchTransactions(); // This will also calculate summary
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchTransactions(); // This will also calculate summary
    }
  }, [user?.id, fetchTransactions]);

  // Chart Data
  const getPieChartData = () => {
    if (!summary || !summary.categoryBreakdown)
      return { labels: [], datasets: [] };

    const expenseCategories = Object.entries(summary.categoryBreakdown).filter(
      ([_, amount]) => typeof amount === "number" && amount > 0
    );

    return {
      labels: expenseCategories.map(
        ([category]) =>
          categories.expense.find((c) => c.value === category)?.label ||
          category
      ),
      datasets: [
        {
          data: expenseCategories.map(([_, amount]) => amount),
          backgroundColor: expenseCategories.map(
            ([category]) =>
              categories.expense.find((c) => c.value === category)?.color ||
              "#C9CBCF"
          ),
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    };
  };

  const getLineChartData = () => {
    if (!summary?.monthlyTrends || !Array.isArray(summary.monthlyTrends)) {
      return { labels: [], datasets: [] };
    }

    return {
      labels: summary.monthlyTrends.map((trend) => trend.month || ""),
      datasets: [
        {
          label: "Income",
          data: summary.monthlyTrends.map((trend) => trend.income || 0),
          borderColor: "#4BC0C0",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.4,
        },
        {
          label: "Expenses",
          data: summary.monthlyTrends.map((trend) => trend.expenses || 0),
          borderColor: "#FF6384",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          tension: 0.4,
        },
      ],
    };
  };

  const getTransactionsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return transactions.filter((t) => {
      const transactionDate = new Date(t.date).toISOString().split("T")[0];
      return transactionDate === dateStr;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="h-8 w-8" />
              Budget Tracker
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your finances and track spending
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog
              open={isBudgetDialogOpen}
              onOpenChange={setIsBudgetDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Set Budget
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Set Category Budget</DialogTitle>
                  <DialogDescription>
                    Set spending limits for categories
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={budgetForm.category}
                      onValueChange={(value) =>
                        setBudgetForm({ ...budgetForm, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.expense.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.icon} {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Monthly Limit ($)</Label>
                    <Input
                      type="number"
                      value={budgetForm.limit}
                      onChange={(e) =>
                        setBudgetForm({ ...budgetForm, limit: e.target.value })
                      }
                      placeholder="1000"
                    />
                  </div>
                  <div>
                    <Label>Month</Label>
                    <Input
                      type="month"
                      value={budgetForm.month}
                      onChange={(e) =>
                        setBudgetForm({ ...budgetForm, month: e.target.value })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => {
                      if (budgetForm.category && budgetForm.limit) {
                        const newBudget: Budget = {
                          id: Date.now().toString(),
                          category: budgetForm.category,
                          limit: parseFloat(budgetForm.limit),
                          spent:
                            summary.categoryBreakdown[budgetForm.category] || 0,
                          month: budgetForm.month,
                          userId: user?.id || "",
                        };
                        setBudgets([...budgets, newBudget]);
                        setBudgetForm({
                          category: "",
                          limit: "",
                          month: new Date().toISOString().slice(0, 7),
                        });
                        setIsBudgetDialogOpen(false);
                      }
                    }}
                  >
                    Set Budget
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isTransactionDialogOpen}
              onOpenChange={setIsTransactionDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Transaction</DialogTitle>
                  <DialogDescription>
                    Record a new income or expense
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={transactionForm.type}
                      onValueChange={(value: "income" | "expense") =>
                        setTransactionForm({ ...transactionForm, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Amount ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={transactionForm.amount}
                      onChange={(e) =>
                        setTransactionForm({
                          ...transactionForm,
                          amount: e.target.value,
                        })
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={transactionForm.category}
                      onValueChange={(value) =>
                        setTransactionForm({
                          ...transactionForm,
                          category: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories[transactionForm.type].map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.icon} {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={transactionForm.note}
                      onChange={(e) =>
                        setTransactionForm({
                          ...transactionForm,
                          note: e.target.value,
                        })
                      }
                      placeholder="Description"
                    />
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={transactionForm.date}
                      onChange={(e) =>
                        setTransactionForm({
                          ...transactionForm,
                          date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={transactionForm.isRecurring}
                      onCheckedChange={(checked) =>
                        setTransactionForm({
                          ...transactionForm,
                          isRecurring: checked,
                        })
                      }
                    />
                    <Label>Recurring Transaction</Label>
                  </div>
                  {transactionForm.isRecurring && (
                    <div>
                      <Label>Frequency</Label>
                      <Select
                        value={transactionForm.recurringFrequency}
                        onValueChange={(value: unknown) =>
                          setTransactionForm({
                            ...transactionForm,
                            recurringFrequency: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={addTransaction} disabled={loading}>
                    {loading ? "Adding..." : "Add Transaction"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <Alert key={index} variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Budget Alert</AlertTitle>
                <AlertDescription>{alert}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Income
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${(summary.totalIncome || 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Expenses
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${(summary.totalExpenses || 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  (summary.balance || 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                ${(summary.balance || 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Your latest financial activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-4">
                      Loading transactions...
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-8">
                      <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No transactions yet
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Start by adding your first transaction
                      </p>
                      <Button onClick={() => setIsTransactionDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Transaction
                      </Button>
                    </div>
                  ) : (
                    transactions
                      .slice(-10)
                      .reverse()
                      .map((transaction) => {
                        const category = categories[transaction.type].find(
                          (c) => c.value === transaction.category
                        );
                        return (
                          <div
                            key={transaction._id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-white">
                                {category?.icon}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {transaction.note}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <span>{category?.label}</span>
                                  {transaction.isRecurring && (
                                    <Badge variant="secondary">
                                      <Repeat className="h-3 w-3 mr-1" />
                                      {transaction.recurringFrequency}
                                    </Badge>
                                  )}
                                  <span>
                                    {new Date(
                                      transaction.date
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`font-semibold ${
                                  transaction.type === "income"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {transaction.type === "income" ? "+" : "-"}$
                                {(transaction.amount || 0).toFixed(2)}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  deleteTransaction(transaction._id)
                                }
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Expense Breakdown
                  </CardTitle>
                  <CardDescription>Spending by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Pie
                      data={getPieChartData()}
                      options={{ responsive: true, maintainAspectRatio: false }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Line Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Monthly Trends
                  </CardTitle>
                  <CardDescription>
                    Income vs Expenses over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Line
                      data={getLineChartData()}
                      options={{ responsive: true, maintainAspectRatio: false }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Transaction Calendar
                  </CardTitle>
                  <CardDescription>View transactions by date</CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              {selectedDate && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Transactions for {selectedDate.toLocaleDateString()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getTransactionsForDate(selectedDate).map(
                        (transaction) => {
                          const category = categories[transaction.type].find(
                            (c) => c.value === transaction.category
                          );
                          return (
                            <div
                              key={transaction._id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-lg">
                                  {category?.icon}
                                </span>
                                <div>
                                  <p className="font-medium">
                                    {transaction.note}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {category?.label}
                                  </p>
                                </div>
                              </div>
                              <span
                                className={`font-semibold ${
                                  transaction.type === "income"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {transaction.type === "income" ? "+" : "-"}$
                                {(transaction.amount || 0).toFixed(2)}
                              </span>
                            </div>
                          );
                        }
                      )}
                      {getTransactionsForDate(selectedDate).length === 0 && (
                        <p className="text-gray-500 text-center py-4">
                          No transactions on this date
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="budgets" className="space-y-6">
            <div className="grid gap-6">
              {budgets.map((budget) => {
                const spent = summary.categoryBreakdown[budget.category] || 0;
                const percentage =
                  budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
                const category = categories.expense.find(
                  (c) => c.value === budget.category
                );

                return (
                  <Card key={budget.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{category?.icon}</span>
                          <span>{category?.label}</span>
                        </div>
                        <Badge
                          variant={
                            percentage > 100
                              ? "destructive"
                              : percentage > 80
                              ? "secondary"
                              : "default"
                          }
                        >
                          {percentage.toFixed(1)}%
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        ${(spent || 0).toFixed(2)} of $
                        {(budget.limit || 0).toFixed(2)} spent this month
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Progress
                        value={Math.min(percentage, 100)}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-600 mt-2">
                        <span>
                          Remaining: $
                          {Math.max(
                            0,
                            (budget.limit || 0) - (spent || 0)
                          ).toFixed(2)}
                        </span>
                        <span>{budget.month}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {budgets.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No budgets set
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Set spending limits for your categories to track your
                      progress
                    </p>
                    <Button onClick={() => setIsBudgetDialogOpen(true)}>
                      <Target className="h-4 w-4 mr-2" />
                      Set Your First Budget
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedBudgetTracker;
