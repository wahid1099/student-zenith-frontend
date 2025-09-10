import { useAuth } from "../contexts/AuthContext";

interface StudyGoal {
  id: string;
  title: string;
  description: string;
  tasks: {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    dueDate?: string;
  }[];
  createdAt: string;
  targetDate?: string;
  progress?: number;
}

interface Todo {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  dueDate: string;
  createdAt: string;
}

interface ClassSchedule {
  _id: string;
  subject: string;
  teacher: string;
  day: string;
  startTime: string;
  endTime: string;
  roomno: string;
  createdAt: string;
}

interface Transaction {
  _id: string;
  description: string;
  amount: number;
  type: string;
  category: string;
  date: string;
  createdAt: string;
}

interface Note {
  _id: string;
  title: string;
  content: string;
  subject: string;
  tags: string[];
  createdAt: string;
}

interface DashboardStats {
  studyHours: number;
  studyHoursChange: number;
  completedTasks: number;
  completedTasksChange: number;
  budgetRemaining: number;
  budgetRemainingChange: number;
  studyStreak: number;
  studyStreakChange: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentGoals: StudyGoal[];
  recentTodos: Todo[];
  upcomingClasses: ClassSchedule[];
  recentTransactions: Transaction[];
  recentNotes: Note[];
}

export const fetchDashboardData = async (
  userId: string
): Promise<DashboardData> => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Authentication token is missing");
  }

  try {
    // Fetch study goals
    const goalsResponse = await fetch(
      `https://student-zenith-backend-msh7.vercel.app/api/v1/study-planner?userId=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Fetch todos
    const todosResponse = await fetch(
      `https://student-zenith-backend-msh7.vercel.app/api/v1/todo?userId=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Fetch classes
    const classesResponse = await fetch(
      `https://student-zenith-backend-msh7.vercel.app/api/v1/class-schedule?userId=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Fetch budget transactions
    const transactionsResponse = await fetch(
      `https://student-zenith-backend-msh7.vercel.app/api/v1/budget?userId=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Fetch notes
    const notesResponse = await fetch(
      `https://student-zenith-backend-msh7.vercel.app/api/v1/notes?userId=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Process responses
    const goalsData = await goalsResponse.json();
    const todosData = await todosResponse.json();
    const classesData = await classesResponse.json();
    const transactionsData = await transactionsResponse.json();
    const notesData = await notesResponse.json();

    // Transform study goals data
    const transformedGoals = goalsData.map((item: any) => ({
      id: item._id,
      title: item.goalTitle,
      description: item.description || "",
      tasks: item.tasks.map((task: any) => ({
        id: task._id,
        title: task.title,
        description: task.description || "",
        completed: task.isCompleted,
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split("T")[0]
          : undefined,
      })),
      createdAt: new Date(item.createdAt).toISOString().split("T")[0],
      targetDate: item.deadline
        ? new Date(item.deadline).toISOString().split("T")[0]
        : undefined,
      progress: item.progress || 0,
    }));

    // Calculate stats
    const completedTasks = todosData.filter(
      (todo: any) => todo.status === "completed"
    ).length;
    const totalBudget = 1000; // This would ideally come from a budget setting
    const expenses = transactionsData
      .filter((transaction: any) => transaction.type === "expense")
      .reduce((sum: number, transaction: any) => sum + transaction.amount, 0);
    const budgetRemaining = totalBudget - expenses;

    // Calculate study hours from goals and tasks
    const studyHours = transformedGoals.reduce(
      (total: number, goal: StudyGoal) => {
        // Assuming each completed task represents 1 hour of study
        const goalHours = goal.tasks.filter((task) => task.completed).length;
        return total + goalHours;
      },
      0
    );

    // Calculate study streak (simplified version)
    const studyStreak = 7; // Placeholder - would need actual login/activity data

    // Prepare dashboard data
    const dashboardData: DashboardData = {
      stats: {
        studyHours,
        studyHoursChange: 12, // Placeholder - would need historical data
        completedTasks,
        completedTasksChange: 8, // Placeholder - would need historical data
        budgetRemaining,
        budgetRemainingChange: -5, // Placeholder - would need historical data
        studyStreak,
        studyStreakChange: 2, // Placeholder - would need historical data
      },
      recentGoals: transformedGoals.slice(0, 3),
      recentTodos: todosData.slice(0, 5),
      upcomingClasses: classesData.slice(0, 3),
      recentTransactions: transactionsData.slice(0, 5),
      recentNotes: notesData.slice(0, 3),
    };

    return dashboardData;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw new Error("Failed to fetch dashboard data");
  }
};
