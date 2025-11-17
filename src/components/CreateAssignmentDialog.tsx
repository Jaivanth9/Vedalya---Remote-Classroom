// src/components/CreateAssignmentDialog.tsx
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { assignmentsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const schema = z.object({
  courseId: z.string().min(1, "Please select a course"),
  title: z.string().trim().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().trim().max(5000).optional(),
  dueDate: z.string().optional(),
  maxScore: z.number().int().min(1, "Max score must be at least 1"),
});

interface CreateAssignmentDialogProps {
  teacherId?: string;
  courses?: Array<any>;
  onSuccess?: () => void;
}

export function CreateAssignmentDialog({ teacherId, courses = [], onSuccess }: CreateAssignmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [courseId, setCourseId] = useState<string>(courses[0]?.id || courses[0]?._id || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<string>("");
  const [maxScore, setMaxScore] = useState<number>(100);
  const { toast } = useToast();

  // keep courseId synced if courses prop updates
  React.useEffect(() => {
    if ((!courseId || courseId === "") && courses.length > 0) {
      const firstId = String(courses[0]._id ?? courses[0].id ?? "");
      setCourseId(firstId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses]);

  const resetForm = () => {
    setCourseId(courses[0]?.id || courses[0]?._id || "");
    setTitle("");
    setDescription("");
    setDueDate("");
    setMaxScore(100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = schema.safeParse({
      courseId,
      title,
      description: description || undefined,
      dueDate: dueDate || undefined,
      maxScore,
    });

    if (!parsed.success) {
      toast({
        title: "Validation error",
        description: parsed.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await assignmentsAPI.create(
        parsed.data.courseId,
        parsed.data.title,
        parsed.data.description || "",
        parsed.data.dueDate || "",
        parsed.data.maxScore
      );

      toast({
        title: "Assignment created",
        description: "The assignment has been created successfully.",
      });

      resetForm();
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Create assignment error:", err);
      toast({
        title: "Error",
        description: err?.message || "Failed to create assignment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Calendar className="h-4 w-4 mr-2" />
          Create Assignment
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Assignment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="course">Course</Label>
            {/* Native select is fine — ensure option has key */}
            <select
              id="course"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full mt-1 rounded-md border px-3 py-2"
              required
            >
              {/* If no courses, show placeholder */}
              {courses.length === 0 ? (
                <option value="" key="no-courses">No courses available</option>
              ) : (
                courses.map((c: any, idx: number) => {
                  const id = String(c._id ?? c.id ?? "");
                  const key = id || `course-${idx}`;
                  return (
                    <option key={key} value={id}>
                      {c.title ?? c.name ?? `Course ${key}`}
                    </option>
                  );
                })
              )}
            </select>
          </div>

          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Assignment title"
              disabled={loading}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional assignment details"
              disabled={loading}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate">Due date</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="maxScore">Max score</Label>
              <Input
                id="maxScore"
                type="number"
                min={1}
                value={String(maxScore)}
                onChange={(e) => setMaxScore(Number(e.target.value || 0))}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm(); }} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Assignment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateAssignmentDialog;
