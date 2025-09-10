// src/components/QnA/ExamGenerator.tsx
import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Plus,
  BookOpen,
  Brain,
  FileText,
  Eye,
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Clock,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface Question {
  question: string;
  answer: string;
  _id: string;
}

interface ExamQA {
  _id: string;
  userId: string;
  subject: string;
  topic: string;
  questions: Question[];
  createdAt: string;
}

const ExamGenerator = () => {
  const { user } = useAuth();
  const [examQAs, setExamQAs] = useState<ExamQA[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [examForm, setExamForm] = useState({
    subject: "",
    topic: "",
  });

  // View states
  const [selectedExam, setSelectedExam] = useState<ExamQA | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set()
  );

  const subjects = [
    "Computer Science",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Engineering",
    "Business",
    "History",
    "Literature",
    "Other",
  ];

  // API Functions
  const fetchExamQAs = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://student-zenith-backend-msh7.vercel.app/api/v1/exam-qa?userId=${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setExamQAs(Array.isArray(data) ? data : []);
      } else {
        throw new Error("Failed to fetch exam Q&As");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch exam Q&As"
      );
      console.error("Error fetching exam Q&As:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const generateExamQA = async () => {
    if (!user?.id || !examForm.subject || !examForm.topic) return;

    setGenerating(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://student-zenith-backend-msh7.vercel.app/api/v1/exam-qa",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            subject: examForm.subject,
            topic: examForm.topic,
          }),
        }
      );

      if (response.ok) {
        const newExamQA = await response.json();
        setExamQAs([newExamQA, ...examQAs]);
        setExamForm({ subject: "", topic: "" });
        setIsCreateDialogOpen(false);
        // Auto-open the generated Q&A in modal
        setSelectedExam(newExamQA);
        setIsViewDialogOpen(true);
      } else {
        throw new Error("Failed to generate exam Q&A");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate exam Q&A"
      );
    } finally {
      setGenerating(false);
    }
  };

  const toggleQuestionExpansion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const handleViewExam = (exam: ExamQA) => {
    setSelectedExam(exam);
    setIsViewDialogOpen(true);
    setExpandedQuestions(new Set()); // Reset expanded questions
  };

  useEffect(() => {
    if (user?.id) {
      fetchExamQAs();
    }
  }, [user?.id, fetchExamQAs]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <Brain className="h-8 w-8 text-white" />
              </div>
              Exam Q&A Generator
            </h1>
            <p className="text-gray-600 mt-3 text-lg">
              Generate AI-powered practice questions and boost your learning
            </p>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Q&A
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-500" />
                  Generate Exam Questions
                </DialogTitle>
                <DialogDescription>
                  Create AI-powered practice questions for your subject and
                  topic
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select
                    value={examForm.subject}
                    onValueChange={(value) =>
                      setExamForm({ ...examForm, subject: value })
                    }
                  >
                    <SelectTrigger className="border-2 focus:border-blue-500">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    value={examForm.topic}
                    onChange={(e) =>
                      setExamForm({ ...examForm, topic: e.target.value })
                    }
                    placeholder="e.g., Database, Algorithms, Machine Learning..."
                    className="border-2 focus:border-blue-500"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={generating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={generateExamQA}
                  disabled={generating || !examForm.subject || !examForm.topic}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {generating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Questions
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            variant="destructive"
            className="mb-6 border-red-200 bg-red-50"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Q&A Sets</p>
                  <p className="text-3xl font-bold">{examQAs.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Total Questions</p>
                  <p className="text-3xl font-bold">
                    {examQAs.reduce(
                      (total, exam) => total + exam.questions.length,
                      0
                    )}
                  </p>
                </div>
                <Brain className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Subjects Covered</p>
                  <p className="text-3xl font-bold">
                    {new Set(examQAs.map((exam) => exam.subject)).size}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Q&A Library */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Question Library
            </h2>
            {generating && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-sm font-medium">
                  Generating questions...
                </span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">
                Loading your question library...
              </p>
            </div>
          ) : examQAs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {examQAs.map((exam) => (
                <Card
                  key={exam._id}
                  className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-lg bg-white/80 backdrop-blur-sm"
                >
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {exam.subject}
                        </CardTitle>
                        <p className="text-purple-600 font-medium mt-1">
                          {exam.topic}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-0"
                      >
                        {exam.questions.length} Q&A
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      {new Date(exam.createdAt).toLocaleDateString()}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">
                          Sample Questions:
                        </h4>
                        <div className="space-y-2">
                          {exam.questions.slice(0, 2).map((q, index) => (
                            <div
                              key={q._id}
                              className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md line-clamp-2"
                            >
                              <span className="font-medium text-blue-600">
                                Q{index + 1}:
                              </span>{" "}
                              {q.question}
                            </div>
                          ))}
                        </div>
                        {exam.questions.length > 2 && (
                          <p className="text-xs text-gray-500 mt-2 font-medium">
                            +{exam.questions.length - 2} more questions
                            available
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={() => handleViewExam(exam)}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View All Questions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Brain className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No questions generated yet
              </h3>
              <p className="text-gray-600 mb-6 text-lg max-w-md mx-auto">
                Start creating AI-powered practice questions to build your
                personalized study library
              </p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                size="lg"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Your First Q&A Set
              </Button>
            </div>
          )}
        </div>
        {/* View Q&A Modal */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                {selectedExam?.subject} - {selectedExam?.topic}
              </DialogTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Generated on{" "}
                  {selectedExam &&
                    new Date(selectedExam.createdAt).toLocaleDateString()}
                </div>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-700"
                >
                  {selectedExam?.questions.length} Questions
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-4 mt-6">
              {selectedExam?.questions.map((q, index) => (
                <Card
                  key={q._id}
                  className="border-l-4 border-l-gradient-to-b from-blue-500 to-purple-500 shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            Question {index + 1}
                          </Badge>
                        </div>
                        <p className="text-gray-800 font-medium leading-relaxed">
                          {q.question}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleQuestionExpansion(q._id)}
                        className="ml-4 hover:bg-blue-50"
                      >
                        {expandedQuestions.has(q._id) ? (
                          <ChevronUp className="h-4 w-4 text-blue-600" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-blue-600" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  {expandedQuestions.has(q._id) && (
                    <CardContent className="pt-0">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-l-4 border-l-green-500">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <h4 className="font-semibold text-green-800">
                            Answer
                          </h4>
                        </div>
                        <div className="text-green-700 leading-relaxed whitespace-pre-wrap">
                          {q.answer}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>

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
                  setIsCreateDialogOpen(true);
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Generate More
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ExamGenerator;
