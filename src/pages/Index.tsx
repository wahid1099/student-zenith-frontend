import React, { useState } from 'react';
import Navigation from '@/components/Layout/Navigation';
import ClassSchedule from '@/components/Schedule/ClassSchedule';
import BudgetTracker from '@/components/Budget/BudgetTracker';
import ExamGenerator from '@/components/QnA/ExamGenerator';
import StudyPlanner from '@/components/Study/StudyPlanner';
import TodoList from '@/components/Todo/TodoList';

const Index = () => {
  const [activeTab, setActiveTab] = useState('schedule');

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'schedule':
        return <ClassSchedule />;
      case 'budget':
        return <BudgetTracker />;
      case 'qna':
        return <ExamGenerator />;
      case 'study':
        return <StudyPlanner />;
      case 'todo':
        return <TodoList />;
      default:
        return <ClassSchedule />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {renderActiveComponent()}
      </main>
    </div>
  );
};

export default Index;
