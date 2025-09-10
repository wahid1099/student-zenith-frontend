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
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Plus,
  Search,
  BookOpen,
  Edit,
  Trash2,
  Tag,
  Calendar,
  FileText,
  Eye,
  Filter,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface Note {
  _id: string;
  userId: string;
  title: string;
  content: string;
  subject: string;
  tags: string[];
  status?: "active" | "archived";
  createdAt: string;
  updatedAt?: string;
}

const NotesManager = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Form state
  const [noteForm, setNoteForm] = useState({
    title: "",
    content: "",
    subject: "",
    tags: "",
  });

  const subjects = [
    "Computer Science",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "History",
    "Literature",
    "Engineering",
    "Business",
    "Other",
  ];

  // API Functions
  const fetchNotes = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://student-zenith-backend-msh7.vercel.app/api/v1/notes?userId=${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotes(Array.isArray(data) ? data : []);
      } else {
        throw new Error("Failed to fetch notes");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch notes");
      console.error("Error fetching notes:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchNoteById = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://student-zenith-backend-msh7.vercel.app/api/v1/notes/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const note = await response.json();
        setSelectedNote(note);
        setIsViewDialogOpen(true);
      }
    } catch (err) {
      console.error("Error fetching note:", err);
    }
  };

  const fetchNotesByCategory = async (category: string) => {
    if (!user?.id) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://student-zenith-backend-msh7.vercel.app/api/v1/notes/category/${category}?userId=${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotes(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching notes by category:", err);
    }
  };

  const createNote = async () => {
    if (!user?.id || !noteForm.title || !noteForm.content) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://student-zenith-backend-msh7.vercel.app/api/v1/notes",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            title: noteForm.title,
            content: noteForm.content,
            subject: noteForm.subject,
            tags: noteForm.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag),
          }),
        }
      );

      if (response.ok) {
        setNoteForm({ title: "", content: "", subject: "", tags: "" });
        setIsCreateDialogOpen(false);
        await fetchNotes();
      } else {
        throw new Error("Failed to create note");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create note");
    } finally {
      setLoading(false);
    }
  };

  const updateNote = async () => {
    if (!selectedNote || !noteForm.title || !noteForm.content) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://student-zenith-backend-msh7.vercel.app/api/v1/notes/${selectedNote._id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: noteForm.title,
            content: noteForm.content,
            subject: noteForm.subject,
            tags: noteForm.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag),
          }),
        }
      );

      if (response.ok) {
        setIsEditDialogOpen(false);
        setSelectedNote(null);
        setNoteForm({ title: "", content: "", subject: "", tags: "" });
        await fetchNotes();
      } else {
        throw new Error("Failed to update note");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update note");
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://student-zenith-backend-msh7.vercel.app/api/v1/notes/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await fetchNotes();
      } else {
        throw new Error("Failed to delete note");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete note");
    }
  };

  const updateNoteStatus = async (
    id: string,
    status: "active" | "archived"
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://student-zenith-backend-msh7.vercel.app/api/v1/notes/${id}/status`,
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
        await fetchNotes();
      }
    } catch (err) {
      console.error("Error updating note status:", err);
    }
  };

  // Event handlers
  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setNoteForm({
      title: note.title,
      content: note.content,
      subject: note.subject,
      tags: note.tags.join(", "),
    });
    setIsEditDialogOpen(true);
  };

  const handleViewNote = (note: Note) => {
    setSelectedNote(note);
    setIsViewDialogOpen(true);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    if (category === "all") {
      fetchNotes();
    } else {
      fetchNotesByCategory(category);
    }
  };

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesSubject =
      selectedSubject === "all" || note.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  // Get unique subjects from notes
  const availableSubjects = Array.from(
    new Set(notes.map((note) => note.subject))
  );

  useEffect(() => {
    if (user?.id) {
      fetchNotes();
    }
  }, [user?.id, fetchNotes]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-8 w-8" />
              My Notes
            </h1>
            <p className="text-gray-600 mt-2">
              Organize and manage your study notes ({notes.length} notes)
            </p>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Note</DialogTitle>
                <DialogDescription>
                  Add a new note to your collection
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={noteForm.title}
                    onChange={(e) =>
                      setNoteForm({ ...noteForm, title: e.target.value })
                    }
                    placeholder="Enter note title"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select
                    value={noteForm.subject}
                    onValueChange={(value) =>
                      setNoteForm({ ...noteForm, subject: value })
                    }
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={noteForm.tags}
                    onChange={(e) =>
                      setNoteForm({ ...noteForm, tags: e.target.value })
                    }
                    placeholder="react, javascript, frontend"
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={noteForm.content}
                    onChange={(e) =>
                      setNoteForm({ ...noteForm, content: e.target.value })
                    }
                    placeholder="Write your note content here..."
                    rows={8}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={createNote} disabled={loading}>
                  {loading ? "Creating..." : "Create Note"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {availableSubjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={handleCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading notes...</p>
          </div>
        )}

        {/* Notes Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <Card
                key={note._id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">
                        {note.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <BookOpen className="h-4 w-4" />
                        {note.subject}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewNote(note)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditNote(note)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNote(note._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {note.content}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {note.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(note.createdAt).toLocaleDateString()}
                    </div>
                    {note.status && (
                      <div className="flex items-center space-x-2">
                        <Label
                          htmlFor={`status-${note._id}`}
                          className="text-xs"
                        >
                          Archive
                        </Label>
                        <Switch
                          id={`status-${note._id}`}
                          checked={note.status === "archived"}
                          onCheckedChange={(checked) =>
                            updateNoteStatus(
                              note._id,
                              checked ? "archived" : "active"
                            )
                          }
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredNotes.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notes found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedSubject !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first note to get started"}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Note
            </Button>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Note</DialogTitle>
              <DialogDescription>
                Update your note information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={noteForm.title}
                  onChange={(e) =>
                    setNoteForm({ ...noteForm, title: e.target.value })
                  }
                  placeholder="Enter note title"
                />
              </div>
              <div>
                <Label htmlFor="edit-subject">Subject</Label>
                <Select
                  value={noteForm.subject}
                  onValueChange={(value) =>
                    setNoteForm({ ...noteForm, subject: value })
                  }
                >
                  <SelectTrigger>
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
                <Label htmlFor="edit-tags">Tags (comma separated)</Label>
                <Input
                  id="edit-tags"
                  value={noteForm.tags}
                  onChange={(e) =>
                    setNoteForm({ ...noteForm, tags: e.target.value })
                  }
                  placeholder="react, javascript, frontend"
                />
              </div>
              <div>
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                  id="edit-content"
                  value={noteForm.content}
                  onChange={(e) =>
                    setNoteForm({ ...noteForm, content: e.target.value })
                  }
                  placeholder="Write your note content here..."
                  rows={8}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={updateNote} disabled={loading}>
                {loading ? "Updating..." : "Update Note"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedNote?.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                {selectedNote?.subject}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1">
                {selectedNote?.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{selectedNote?.content}</p>
              </div>
              <div className="flex items-center text-sm text-gray-500 pt-4 border-t">
                <Calendar className="h-4 w-4 mr-1" />
                Created:{" "}
                {selectedNote &&
                  new Date(selectedNote.createdAt).toLocaleDateString()}
                {selectedNote?.updatedAt && (
                  <>
                    {" • Updated: "}
                    {new Date(selectedNote.updatedAt).toLocaleDateString()}
                  </>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsViewDialogOpen(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setIsViewDialogOpen(false);
                  if (selectedNote) handleEditNote(selectedNote);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default NotesManager;
