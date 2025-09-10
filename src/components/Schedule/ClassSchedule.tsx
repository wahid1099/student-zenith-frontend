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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  User,
  Book,
  MapPin,
  Calendar,
  AlertCircle,
  Sparkles,
  GraduationCap,
  Filter,
  Eye,
  CalendarDays,
  Users,
  BookOpen,
  Home,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ClassItem {
  _id: string;
  userId: string;
  subject: string;
  teacher: string;
  day: string;
  startTime: string;
  endTime: string;
  roomno: string;
  createdAt: string;
  updatedAt: string;
}

const ClassSchedule: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    subject: "",
    teacher: "",
    day: "",
    startTime: "",
    endTime: "",
    roomno: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [activeTab, setActiveTab] = useState("schedule");
  const [filterDay, setFilterDay] = useState<string>("all");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [filterTeacher, setFilterTeacher] = useState<string>("all");

  const days = [
    {
      value: "Monday",
      label: "Monday",
      icon: "📅",
      color: "bg-blue-100 text-blue-700",
    },
    {
      value: "Tuesday",
      label: "Tuesday",
      icon: "📅",
      color: "bg-green-100 text-green-700",
    },
    {
      value: "Wednesday",
      label: "Wednesday",
      icon: "📅",
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      value: "Thursday",
      label: "Thursday",
      icon: "📅",
      color: "bg-purple-100 text-purple-700",
    },
    {
      value: "Friday",
      label: "Friday",
      icon: "📅",
      color: "bg-red-100 text-red-700",
    },
    {
      value: "Saturday",
      label: "Saturday",
      icon: "📅",
      color: "bg-indigo-100 text-indigo-700",
    },
    {
      value: "Sunday",
      label: "Sunday",
      icon: "📅",
      color: "bg-pink-100 text-pink-700",
    },
  ];

  // API Functions
  const fetchClasses = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://student-zenith-backend-msh7.vercel.app/api/v1/class-schedule?userId=${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setClasses(Array.isArray(data) ? data : []);
      } else {
        throw new Error("Failed to fetch classes");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch classes");
      console.error("Error fetching classes:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchWeeklyTimetable = useCallback(async () => {
    if (!user?.id) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://student-zenith-backend-msh7.vercel.app/api/v1/class-schedule/week?userId=${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setClasses(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching weekly timetable:", err);
    }
  }, [user?.id]);

  const fetchClassById = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://student-zenith-backend-msh7.vercel.app/api/v1/class-schedule/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const classData = await response.json();
        setSelectedClass(classData);
        setIsViewDialogOpen(true);
      }
    } catch (err) {
      console.error("Error fetching class:", err);
    }
  };

  const fetchClassesByDay = async (day: string) => {
    if (!user?.id) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://student-zenith-backend-msh7.vercel.app/api/v1/class-schedule/day/${day}?userId=${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setClasses(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching classes by day:", err);
    }
  };

  const fetchClassesBySubject = async (subject: string) => {
    if (!user?.id) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://student-zenith-backend-msh7.vercel.app/api/v1/class-schedule/subject/${subject}?userId=${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setClasses(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching classes by subject:", err);
    }
  };

  const fetchClassesByTeacher = async (teacher: string) => {
    if (!user?.id) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://student-zenith-backend-msh7.vercel.app/api/v1/class-schedule/teacher/${teacher}?userId=${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setClasses(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching classes by teacher:", err);
    }
  };

  const createClass = async () => {
    if (
      !user?.id ||
      !formData.subject ||
      !formData.teacher ||
      !formData.day ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.roomno
    )
      return;

    setCreating(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://student-zenith-backend-msh7.vercel.app/api/v1/class-schedule",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            subject: formData.subject,
            teacher: formData.teacher,
            day: formData.day,
            startTime: formData.startTime,
            endTime: formData.endTime,
            roomno: formData.roomno,
          }),
        }
      );

      if (response.ok) {
        setFormData({
          subject: "",
          teacher: "",
          day: "",
          startTime: "",
          endTime: "",
          roomno: "",
        });
        setIsDialogOpen(false);
        await fetchClasses();
      } else {
        throw new Error("Failed to create class");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create class");
    } finally {
      setCreating(false);
    }
  };

  const updateClass = async () => {
    if (
      !editingId ||
      !formData.subject ||
      !formData.teacher ||
      !formData.day ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.roomno
    )
      return;

    setCreating(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://student-zenith-backend-msh7.vercel.app/api/v1/class-schedule/${editingId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subject: formData.subject,
            teacher: formData.teacher,
            day: formData.day,
            startTime: formData.startTime,
            endTime: formData.endTime,
            roomno: formData.roomno,
          }),
        }
      );

      if (response.ok) {
        setFormData({
          subject: "",
          teacher: "",
          day: "",
          startTime: "",
          endTime: "",
          roomno: "",
        });
        setEditingId(null);
        setIsDialogOpen(false);
        await fetchClasses();
      } else {
        throw new Error("Failed to update class");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update class");
    } finally {
      setCreating(false);
    }
  };

  const deleteClass = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://student-zenith-backend-msh7.vercel.app/api/v1/class-schedule/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await fetchClasses();
      } else {
        throw new Error("Failed to delete class");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete class");
    }
  };

  // Event handlers
  const handleEdit = (classItem: ClassItem) => {
    setFormData({
      subject: classItem.subject,
      teacher: classItem.teacher,
      day: classItem.day,
      startTime: classItem.startTime,
      endTime: classItem.endTime,
      roomno: classItem.roomno,
    });
    setEditingId(classItem._id);
    setIsDialogOpen(true);
  };

  const handleFilterChange = (
    type: "day" | "subject" | "teacher",
    value: string
  ) => {
    switch (type) {
      case "day":
        setFilterDay(value);
        if (value === "all") {
          fetchClasses();
        } else {
          fetchClassesByDay(value);
        }
        break;
      case "subject":
        setFilterSubject(value);
        if (value === "all") {
          fetchClasses();
        } else {
          fetchClassesBySubject(value);
        }
        break;
      case "teacher":
        setFilterTeacher(value);
        if (value === "all") {
          fetchClasses();
        } else {
          fetchClassesByTeacher(value);
        }
        break;
    }
  };

  const getClassesForDay = (day: string) => {
    return classes
      .filter((cls) => cls.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const formatTime = (startTime: string, endTime: string) => {
    return `${startTime} - ${endTime}`;
  };

  const getStats = () => {
    const totalClasses = classes.length;
    const uniqueSubjects = new Set(classes.map((cls) => cls.subject)).size;
    const uniqueTeachers = new Set(classes.map((cls) => cls.teacher)).size;
    const uniqueRooms = new Set(classes.map((cls) => cls.roomno)).size;

    return { totalClasses, uniqueSubjects, uniqueTeachers, uniqueRooms };
  };

  useEffect(() => {
    if (user?.id) {
      fetchClasses();
    }
  }, [user?.id, fetchClasses]);

  const stats = getStats();
  const uniqueSubjects = Array.from(new Set(classes.map((cls) => cls.subject)));
  const uniqueTeachers = Array.from(new Set(classes.map((cls) => cls.teacher)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              Class Schedule
            </h1>
            <p className="text-gray-600 mt-3 text-lg">
              Manage your academic timetable and stay organized (
              {classes.length} classes)
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Sparkles className="mr-2 h-4 w-4" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-emerald-500" />
                  {editingId ? "Edit Class" : "Add New Class"}
                </DialogTitle>
                <DialogDescription>
                  {editingId
                    ? "Update your class details"
                    : "Add a new class to your schedule"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    placeholder="e.g., Mathematics, Physics..."
                    className="border-2 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <Label htmlFor="teacher">Teacher</Label>
                  <Input
                    id="teacher"
                    value={formData.teacher}
                    onChange={(e) =>
                      setFormData({ ...formData, teacher: e.target.value })
                    }
                    placeholder="e.g., Dr. Smith, Prof. Johnson..."
                    className="border-2 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <Label htmlFor="day">Day</Label>
                  <Select
                    value={formData.day}
                    onValueChange={(value) =>
                      setFormData({ ...formData, day: value })
                    }
                  >
                    <SelectTrigger className="border-2 focus:border-emerald-500">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map((day) => (
                        <SelectItem key={day.value} value={day.value}>
                          <div className="flex items-center gap-2">
                            <span>{day.icon}</span>
                            <span>{day.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                      className="border-2 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                      className="border-2 focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="roomno">Room Number</Label>
                  <Input
                    id="roomno"
                    value={formData.roomno}
                    onChange={(e) =>
                      setFormData({ ...formData, roomno: e.target.value })
                    }
                    placeholder="e.g., Room 201, Lab 3..."
                    className="border-2 focus:border-emerald-500"
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
                      subject: "",
                      teacher: "",
                      day: "",
                      startTime: "",
                      endTime: "",
                      roomno: "",
                    });
                  }}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={editingId ? updateClass : createClass}
                  disabled={
                    creating ||
                    !formData.subject ||
                    !formData.teacher ||
                    !formData.day ||
                    !formData.startTime ||
                    !formData.endTime ||
                    !formData.roomno
                  }
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingId ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      {editingId ? "Update" : "Add"} Class
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Total Classes</p>
                  <p className="text-2xl font-bold">{stats.totalClasses}</p>
                </div>
                <BookOpen className="h-6 w-6 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100 text-sm">Subjects</p>
                  <p className="text-2xl font-bold">{stats.uniqueSubjects}</p>
                </div>
                <Book className="h-6 w-6 text-teal-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100 text-sm">Teachers</p>
                  <p className="text-2xl font-bold">{stats.uniqueTeachers}</p>
                </div>
                <Users className="h-6 w-6 text-cyan-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Rooms</p>
                  <p className="text-2xl font-bold">{stats.uniqueRooms}</p>
                </div>
                <Home className="h-6 w-6 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-600" />
                <Label className="font-medium">Day:</Label>
                <Select
                  value={filterDay}
                  onValueChange={(value) => handleFilterChange("day", value)}
                >
                  <SelectTrigger className="w-40 border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Days</SelectItem>
                    {days.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        <div className="flex items-center gap-2">
                          <span>{day.icon}</span>
                          <span>{day.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Book className="h-4 w-4 text-gray-600" />
                <Label className="font-medium">Subject:</Label>
                <Select
                  value={filterSubject}
                  onValueChange={(value) =>
                    handleFilterChange("subject", value)
                  }
                >
                  <SelectTrigger className="w-40 border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {uniqueSubjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-600" />
                <Label className="font-medium">Teacher:</Label>
                <Select
                  value={filterTeacher}
                  onValueChange={(value) =>
                    handleFilterChange("teacher", value)
                  }
                >
                  <SelectTrigger className="w-40 border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teachers</SelectItem>
                    {uniqueTeachers.map((teacher) => (
                      <SelectItem key={teacher} value={teacher}>
                        {teacher}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="schedule">Weekly Schedule</TabsTrigger>
            <TabsTrigger value="list">Class List</TabsTrigger>
          </TabsList>

          {/* Weekly Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">
                  Loading your schedule...
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {days.map((day, dayIndex) => {
                  const dayClasses = getClassesForDay(day.value);
                  return (
                    <Card
                      key={day.value}
                      className="group bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      style={{
                        animationDelay: `${dayIndex * 100}ms`,
                        animation: "fadeInUp 0.5s ease-out forwards",
                      }}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${day.color
                                .replace("text-", "bg-")
                                .replace("-700", "-500")} text-white`}
                            >
                              <CalendarDays className="h-5 w-5" />
                            </div>
                            <div>
                              <CardTitle className="text-xl font-bold">
                                {day.label}
                              </CardTitle>
                              <CardDescription>
                                {dayClasses.length}{" "}
                                {dayClasses.length === 1 ? "class" : "classes"}{" "}
                                scheduled
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className={day.color}>
                            {dayClasses.length}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {dayClasses.length === 0 ? (
                          <div className="text-center py-8">
                            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">
                              No classes scheduled
                            </p>
                            <p className="text-gray-400 text-sm">
                              Add a class to get started
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {dayClasses.map((classItem, index) => (
                              <div
                                key={classItem._id}
                                className="group/item p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border-l-4 border-l-emerald-500 hover:shadow-md transition-all duration-200"
                                style={{
                                  animationDelay: `${
                                    dayIndex * 100 + index * 50
                                  }ms`,
                                  animation:
                                    "slideInLeft 0.5s ease-out forwards",
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                      <div className="p-2 bg-emerald-100 rounded-lg">
                                        <Book className="h-4 w-4 text-emerald-600" />
                                      </div>
                                      <h4 className="text-lg font-semibold text-gray-900 group-hover/item:text-emerald-600 transition-colors">
                                        {classItem.subject}
                                      </h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                      <div className="flex items-center gap-2 text-gray-600">
                                        <User className="h-4 w-4 text-emerald-500" />
                                        <span className="font-medium">
                                          {classItem.teacher}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 text-gray-600">
                                        <Clock className="h-4 w-4 text-blue-500" />
                                        <span className="font-medium">
                                          {formatTime(
                                            classItem.startTime,
                                            classItem.endTime
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 text-gray-600">
                                        <MapPin className="h-4 w-4 text-red-500" />
                                        <span className="font-medium">
                                          {classItem.roomno}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        fetchClassById(classItem._id)
                                      }
                                      className="hover:scale-110 transition-all duration-200"
                                    >
                                      <Eye className="h-4 w-4 text-emerald-600" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEdit(classItem)}
                                      className="hover:scale-110 transition-all duration-200"
                                    >
                                      <Edit className="h-4 w-4 text-blue-600" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => deleteClass(classItem._id)}
                                      className="hover:scale-110 transition-all duration-200 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Class List Tab */}
          <TabsContent value="list" className="space-y-4">
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Loading classes...</p>
              </div>
            ) : classes.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="text-center py-16">
                  <div className="bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <GraduationCap className="h-12 w-12 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    No classes scheduled yet
                  </h3>
                  <p className="text-gray-600 mb-6 text-lg max-w-md mx-auto">
                    Create your first class to start building your academic
                    schedule
                  </p>
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    size="lg"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Add Your First Class
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((classItem, index) => {
                  const dayInfo = days.find((d) => d.value === classItem.day);
                  return (
                    <Card
                      key={classItem._id}
                      className="group bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: "fadeInUp 0.5s ease-out forwards",
                      }}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={dayInfo?.color}>
                            {dayInfo?.icon} {classItem.day}
                          </Badge>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => fetchClassById(classItem._id)}
                              className="hover:scale-110 transition-all duration-200"
                            >
                              <Eye className="h-4 w-4 text-emerald-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(classItem)}
                              className="hover:scale-110 transition-all duration-200"
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteClass(classItem._id)}
                              className="hover:scale-110 transition-all duration-200 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                        <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                          {classItem.subject}
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          {classItem.teacher}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">
                              {formatTime(
                                classItem.startTime,
                                classItem.endTime
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 text-red-500" />
                            <span className="font-medium">
                              {classItem.roomno}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Added{" "}
                              {new Date(
                                classItem.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* View Class Modal */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                  <Book className="h-5 w-5 text-white" />
                </div>
                {selectedClass?.subject}
              </DialogTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Added{" "}
                  {selectedClass &&
                    new Date(selectedClass.createdAt).toLocaleDateString()}
                </div>
                <Badge
                  className={
                    days.find((d) => d.value === selectedClass?.day)?.color
                  }
                >
                  {selectedClass?.day}
                </Badge>
              </div>
            </DialogHeader>

            {selectedClass && (
              <div className="space-y-6 mt-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <User className="h-4 w-4 text-emerald-500" />
                      Teacher
                    </h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg font-medium">
                      {selectedClass.teacher}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-500" />
                      Room
                    </h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg font-medium">
                      {selectedClass.roomno}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Time
                  </h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg font-medium">
                    {formatTime(selectedClass.startTime, selectedClass.endTime)}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-purple-500" />
                    Schedule Details
                  </h4>
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg border-l-4 border-l-emerald-500">
                    <p className="text-emerald-800 font-medium">
                      Every {selectedClass.day} from {selectedClass.startTime}{" "}
                      to {selectedClass.endTime}
                    </p>
                    <p className="text-emerald-600 text-sm mt-1">
                      Location: {selectedClass.roomno} • Instructor:{" "}
                      {selectedClass.teacher}
                    </p>
                  </div>
                </div>
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
                  if (selectedClass) handleEdit(selectedClass);
                }}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Class
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

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ClassSchedule;
