// src/components/SubmitAssignmentDialog.tsx
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { submissionsAPI } from "@/lib/api";
import { format } from "date-fns";

interface Props {
  assignmentId: string;
  existingSubmission?: any;
  onSuccess?: (createdSubmission?: any) => void;
}

export function SubmitAssignmentDialog({ assignmentId, existingSubmission, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setText(existingSubmission?.submissionText ?? "");
    setFileUrl(existingSubmission?.submissionFileUrl ?? "");
  }, [existingSubmission, open]);

  const tryFindSubmissionFromList = (list: any[], assignmentIdLocal: string, currentUserId?: string) => {
    if (!Array.isArray(list) || list.length === 0) return null;

    // best-effort matching: match by assignment id fields and by student id fields
    const matches = list.filter((s: any) => {
      const sAssign = s.assignment_id ?? s.assignmentId ?? s.assignment ?? (s.assignment && (s.assignment._id ?? s.assignment.id));
      const sStudent = s.student_id ?? s.studentId ?? (s.student && (s.student._id ?? s.student.id)) ?? s.student;
      const assignMatch = sAssign && (String(sAssign) === String(assignmentIdLocal) || String(sAssign) === String((assignmentIdLocal ?? "").toString()));
      const studentMatch = currentUserId ? String(sStudent) === String(currentUserId) : true;
      return assignMatch && studentMatch;
    });

    // pick most recent by createdAt/submitted_at
    if (matches.length === 0) return null;
    matches.sort((a: any, b: any) => {
      const ta = new Date(a.submitted_at ?? a.submittedAt ?? a.createdAt ?? a.created_at ?? a.created ?? 0).getTime();
      const tb = new Date(b.submitted_at ?? b.submittedAt ?? b.createdAt ?? b.created_at ?? b.created ?? 0).getTime();
      return tb - ta;
    });
    return matches[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // if an existing submission exists, prevent re-submit
    if (existingSubmission) {
      toast({
        title: "Already submitted",
        description: "You have already submitted this assignment and cannot submit again.",
        variant: "destructive",
      });
      return;
    }

    const effectiveAssignmentId = assignmentId || existingSubmission?.assignmentId || existingSubmission?.assignment_id || "";

    if (!effectiveAssignmentId) {
      toast({
        title: "Missing assignment",
        description: "Cannot submit because assignment id is missing.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const trimmedText = (text ?? "").trim();

      // primary: attempt create and expect created object returned
      const created = await submissionsAPI.create(effectiveAssignmentId, trimmedText, fileUrl || undefined);

      // Debug log so you can inspect network response quickly
      // open devtools console to see these logs
      // eslint-disable-next-line no-console
      console.debug("[SubmitAssignmentDialog] submissionsAPI.create returned:", created);

      if (created && typeof created === "object" && (created._id || created.id || created.assignment_id)) {
        toast({ title: "Submitted", description: "Your submission was saved." });
        setOpen(false);
        onSuccess?.(created);
      } else {
        // fallback: API didn't return created submission object or returned minimal response.
        // Fetch all submissions and try to find the created one (best-effort).
        // Also include current user id matching if available (from window.__USER or caller)
        let fallbackFound: any = null;
        try {
          const all = Array.isArray(await submissionsAPI.getAll()) ? await submissionsAPI.getAll() : [];
          // attempt to detect current user id from common places on response or window - best-effort
          const currentUserId = (created && (created.student_id ?? created.studentId ?? created.student)) || (existingSubmission && (existingSubmission.student_id ?? existingSubmission.studentId ?? existingSubmission.student));
          fallbackFound = tryFindSubmissionFromList(all, effectiveAssignmentId, currentUserId ? String(currentUserId) : undefined);

          // debug info
          // eslint-disable-next-line no-console
          console.debug("[SubmitAssignmentDialog] fallback search - all submissions length:", all.length, "found:", fallbackFound);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn("[SubmitAssignmentDialog] fallback submissions fetch failed", err);
        }

        // If we found something, treat as success and return it, otherwise still show success toast and call onSuccess without payload
        toast({ title: "Submitted", description: "Your submission was saved." });
        setOpen(false);
        onSuccess?.(fallbackFound ?? undefined);
      }
    } catch (err: any) {
      // detect 409 (already submitted)
      const status = err?.status ?? err?.response?.status ?? err?.statusCode;
      // eslint-disable-next-line no-console
      console.error("[SubmitAssignmentDialog] create error", err);
      if (status === 409 || /already submitted/i.test(String(err?.message ?? err?.data?.error ?? ""))) {
        toast({
          title: "Already submitted",
          description: "You have already submitted this assignment.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: err?.message || "Failed to submit",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const isSubmitted = Boolean(existingSubmission);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">{isSubmitted ? "View Submission" : "Submit"}</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isSubmitted ? "View Submission" : "Submit Assignment"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSubmitted ? (
            <div>
              <p className="text-sm text-muted-foreground">You have already submitted for this assignment.</p>
              <div className="mt-3 p-3 bg-muted/50 rounded whitespace-pre-wrap text-sm">
                {existingSubmission?.submissionText ?? "(no text provided)"}
              </div>
              {existingSubmission?.submissionFileUrl && (
                <div className="mt-2">
                  <a href={existingSubmission.submissionFileUrl} target="_blank" rel="noopener noreferrer" className="text-sm underline">
                    View attached file
                  </a>
                </div>
              )}
              <div className="mt-2 text-xs text-muted-foreground">
                Submitted: {existingSubmission?.submitted_at ? format(new Date(existingSubmission.submitted_at), "PPp") : (existingSubmission?.submittedAt ? format(new Date(existingSubmission.submittedAt), "PPp") : "Unknown")}
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Text</label>
                <Textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">File URL (optional)</label>
                <Input placeholder="https://drive.google.com/..." value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            {!isSubmitted && (
              <Button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit"}</Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default SubmitAssignmentDialog;
