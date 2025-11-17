// src/components/GradeSubmissionDialog.tsx
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { submissionsAPI } from "@/lib/api";
import { format } from "date-fns";

interface Props {
  submission: any;
  maxScore?: number | null;
  onSuccess?: (updatedSubmission?: any) => void;
}

export function GradeSubmissionDialog({ submission, maxScore, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [grade, setGrade] = useState<string | number>("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const id = String(submission?._id ?? submission?.id ?? submission?.submission_id ?? "");
  const alreadyGraded =
    submission?.status === "graded" ||
    (submission?.grade !== undefined && submission?.grade !== null);

  useEffect(() => {
    if (open) {
      setGrade(submission?.grade ?? "");
      setFeedback(submission?.feedback ?? "");
    }
  }, [open, submission]);

  const detect409 = (err: any) => {
    if (!err) return false;
    if (err.status === 409) return true;
    if (err?.response?.status === 409) return true;
    if (typeof err === "object" && /already graded/i.test(String(err?.message ?? err?.data?.error ?? ""))) return true;
    return false;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault?.();
    if (!id) {
      toast({ title: "Error", description: "Missing submission id", variant: "destructive" });
      return;
    }
    if (alreadyGraded) {
      toast({ title: "Already graded", description: "This submission has already been graded.", variant: "destructive" });
      return;
    }
    if (grade === "" || grade === null || grade === undefined) {
      toast({ title: "Validation", description: "Please enter a grade.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // assume API returns the updated submission object
      const updated = await submissionsAPI.grade(id, Number(grade), feedback);
      toast({ title: "Saved", description: "Grade saved successfully." });
      setOpen(false);
      onSuccess?.(updated);
    } catch (err: any) {
      if (detect409(err)) {
        toast({
          title: "Already graded",
          description: err?.data?.error ?? err?.message ?? "This submission was already graded.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: err?.message ?? "Failed to save grade",
          variant: "destructive",
        });
      }
      // still notify parent to re-fetch to ensure consistency
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  };

  // Prefer server-provided studentName, then populated student.*, then fallbacks
  const studentLabel =
    submission?.studentName ??
    submission?.student?.fullName ??
    submission?.student?.username ??
    submission?.studentName ??
    submission?.studentName ??
    (submission?.student_id ? String(submission.student_id).slice(0, 8) : "Student");

  const submittedAt = submission?.submitted_at ?? submission?.submittedAt ?? submission?.createdAt;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={!submission}>
          {alreadyGraded ? "View Grade" : "Grade"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{alreadyGraded ? "View Grade" : "Grade Submission"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Student: {studentLabel}
            </p>
            <p className="text-sm text-muted-foreground">
              Submitted: {submittedAt ? format(new Date(submittedAt), "PPp") : "Unknown"}
            </p>

            {submission?.submissionText && (
              <div className="mt-2 p-2 border rounded bg-muted/50 whitespace-pre-wrap text-sm">
                {submission.submissionText}
              </div>
            )}

            {submission?.submissionFileUrl && (
              <div className="mt-2">
                <a href={submission.submissionFileUrl} target="_blank" rel="noopener noreferrer" className="text-sm underline">
                  View attached file
                </a>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Grade {maxScore ? `(out of ${maxScore})` : ""}
            </label>
            <Input
              type="number"
              value={String(grade)}
              onChange={(e) => setGrade(e.target.value)}
              disabled={alreadyGraded || loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Feedback (optional)</label>
            <Textarea
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={alreadyGraded || loading}
            />
          </div>

          {alreadyGraded && (
            <div className="p-3 bg-muted rounded text-sm">
              <div><strong>Grade:</strong> {submission?.grade}</div>
              {submission?.feedback && <div className="mt-2"><strong>Feedback:</strong><div className="whitespace-pre-wrap">{submission.feedback}</div></div>}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Close</Button>
            {!alreadyGraded && (
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Grade"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
