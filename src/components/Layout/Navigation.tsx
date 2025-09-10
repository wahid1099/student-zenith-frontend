import React from "react";
import { Button } from "@/components/ui/button";
import {
  Moon,
  Sun,
  Calendar,
  Wallet,
  Brain,
  Target,
  CheckSquare,
  GraduationCap,
  StickyNote,
  Home,
  User,
  LogOut,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "budget", label: "Budget", icon: Wallet },
    { id: "qna", label: "Q&A Gen", icon: Brain },
    { id: "study", label: "Study Plan", icon: Target },
    { id: "todo", label: "To-Do", icon: CheckSquare },
  ];

  return (
    <div className="bg-gradient-card border-b shadow-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-primary rounded-xl shadow-glow">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Student Toolkit
              </h1>
              <p className="text-xs text-muted-foreground">
                Your academic companion
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center space-x-2 transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-primary shadow-glow transform scale-105"
                      : "hover:bg-secondary hover:scale-105"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.label}</span>
                </Button>
              );
            })}
          </nav>

          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="ml-4 hover:bg-secondary hover:scale-110 transition-all duration-300"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center space-x-1 transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-primary shadow-glow"
                      : "hover:bg-secondary"
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
