import { useAuth } from "../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  BookOpen,
  Calendar,
  CheckSquare,
  DollarSign,
  MessageSquare,
  StickyNote,
  TrendingUp,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchDashboardData } from "../services/dashboardService";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { cn } from "../lib/utils";

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await fetchDashboardData(user.id);
        setDashboardData(data);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id]);

  const features = [
    {
      title: "Notes",
      description: "Organize your study notes and materials",
      icon: StickyNote,
      href: "/notes",
      color: "bg-blue-500",
    },
    {
      title: "Q&A",
      description: "Practice with questions and exam prep",
      icon: MessageSquare,
      href: "/qna",
      color: "bg-green-500",
    },
    {
      title: "Schedule",
      description: "Manage your class schedule and events",
      icon: Calendar,
      href: "/schedule",
      color: "bg-purple-500",
    },
    {
      title: "Study Planner",
      description: "Plan and track your study sessions",
      icon: BookOpen,
      href: "/study",
      color: "bg-orange-500",
    },
    {
      title: "Todo List",
      description: "Keep track of assignments and tasks",
      icon: CheckSquare,
      href: "/todo",
      color: "bg-red-500",
    },
    {
      title: "Budget Tracker",
      description: "Manage your student finances",
      icon: DollarSign,
      href: "/budget",
      color: "bg-emerald-500",
    },
  ];

  // Use real data if available, otherwise fallback to dummy data
  const stats = dashboardData ? [
    {
      title: "Study Hours This Week",
      value: `${dashboardData.stats.studyHours}h`,
      icon: Clock,
      change: `${dashboardData.stats.studyHoursChange > 0 ? '+' : ''}${dashboardData.stats.studyHoursChange}%`,
      isPositive: dashboardData.stats.studyHoursChange >= 0,
    },
    {
      title: "Completed Tasks",
      value: dashboardData.stats.completedTasks.toString(),
      icon: CheckSquare,
      change: `${dashboardData.stats.completedTasksChange > 0 ? '+' : ''}${dashboardData.stats.completedTasksChange}%`,
      isPositive: dashboardData.stats.completedTasksChange >= 0,
    },
    {
      title: "Budget Remaining",
      value: `$${dashboardData.stats.budgetRemaining.toFixed(2)}`,
      icon: DollarSign,
      change: `${dashboardData.stats.budgetRemainingChange > 0 ? '+' : ''}${dashboardData.stats.budgetRemainingChange}%`,
      isPositive: dashboardData.stats.budgetRemainingChange >= 0,
    },
    {
      title: "Study Streak",
      value: `${dashboardData.stats.studyStreak} days`,
      icon: TrendingUp,
      change: `${dashboardData.stats.studyStreakChange > 0 ? '+' : ''}${dashboardData.stats.studyStreakChange} days`,
      isPositive: dashboardData.stats.studyStreakChange >= 0,
    },
  ] : [
    {
      title: "Study Hours This Week",
      value: "24h",
      icon: Clock,
      change: "+12%",
      isPositive: true,
    },
    {
      title: "Completed Tasks",
      value: "18",
      icon: CheckSquare,
      change: "+8%",
      isPositive: true,
    },
    {
      title: "Budget Remaining",
      value: "$450",
      icon: DollarSign,
      change: "-5%",
      isPositive: false,
    },
    {
      title: "Study Streak",
      value: "7 days",
      icon: TrendingUp,
      change: "+2 days",
      isPositive: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your studies today.
          </p>
        </div>
        
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {loading ? (
            // Skeleton loaders for stats
            Array(4).fill(0).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </CardContent>
              </Card>
            ))
          ) : (
            stats.map((stat, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-md transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={cn(
                    "p-1.5 rounded-full", 
                    stat.isPositive ? "bg-green-100" : "bg-red-100"
                  )}>
                    <stat.icon className={cn(
                      "h-4 w-4", 
                      stat.isPositive ? "text-green-600" : "text-red-600"
                    )} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className={cn(
                    "text-xs mt-1 flex items-center",
                    stat.isPositive ? "text-green-600" : "text-red-600"
                  )}>
                    {stat.change} from last week
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {loading ? (
            // Skeleton loaders for features
            Array(6).fill(0).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))
          ) : (
            features.map((feature, index) => (
              <Card
                key={index}
                className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer bg-white/80 backdrop-blur-sm"
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${feature.color}`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Link to={feature.href}>
                    <Button className="w-full bg-gradient-primary hover:scale-105 transition-all duration-300">
                      Open {feature.title}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        {/* Recent Activity Section */}
        {!loading && dashboardData && (
          <div className="mt-8 space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Recent Activity</h2>
            
            {/* Recent Goals */}
            {dashboardData.recentGoals.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-orange-500" />
                  Study Goals
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardData.recentGoals.map((goal: any) => (
                    <Card key={goal.id} className="overflow-hidden hover:shadow-md transition-all duration-300">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{goal.title}</CardTitle>
                        <CardDescription className="line-clamp-1">{goal.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="h-2" />
                        <div className="flex justify-between items-center text-xs text-gray-500 pt-1">
                          <span>Created: {goal.createdAt}</span>
                          {goal.targetDate && <span>Due: {goal.targetDate}</span>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {/* Recent Todos */}
            {dashboardData.recentTodos.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                  <CheckSquare className="h-5 w-5 mr-2 text-destructive" />
                  Recent Tasks
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dashboardData.recentTodos.map((todo: any) => (
                    <div key={todo._id} className="flex items-center p-3 bg-card rounded-lg border hover:shadow-sm transition-all duration-300">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{todo.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">{todo.description}</p>
                      </div>
                      <Badge className={todo.status === "completed" ? "bg-success/10 text-success" : 
                                      todo.status === "in-progress" ? "bg-primary/10 text-primary" : 
                                      "bg-muted/50 text-muted-foreground"}>
                        {todo.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Upcoming Classes */}
            {dashboardData.upcomingClasses.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  Upcoming Classes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {dashboardData.upcomingClasses.map((classItem: any) => (
                    <Card key={classItem._id} className="overflow-hidden hover:shadow-md transition-all duration-300">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{classItem.subject}</CardTitle>
                        <CardDescription>{classItem.teacher}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{classItem.day}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{classItem.startTime} - {classItem.endTime}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Loading Indicator */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-gray-600">Loading your dashboard data...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
