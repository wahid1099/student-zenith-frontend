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
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();

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

  const stats = [
    {
      title: "Study Hours This Week",
      value: "24h",
      icon: Clock,
      change: "+12%",
    },
    {
      title: "Completed Tasks",
      value: "18",
      icon: CheckSquare,
      change: "+8%",
    },
    {
      title: "Budget Remaining",
      value: "$450",
      icon: DollarSign,
      change: "-5%",
    },
    {
      title: "Study Streak",
      value: "7 days",
      icon: TrendingUp,
      change: "+2 days",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your studies today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-green-600 mt-1">
                  {stat.change} from last week
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow cursor-pointer"
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
                  <Button className="w-full">Open {feature.title}</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
