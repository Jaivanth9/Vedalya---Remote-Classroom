// src/components/QueriesList.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { queriesAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type QueryItem = any;

export function QueriesList({ queries = [], onRefetch }: { queries?: QueryItem[] | any; onRefetch?: () => void }) {
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const { toast } = useToast();

  // debug render start
  // eslint-disable-next-line no-console
  console.debug('[QueriesList] render start', { queriesType: Array.isArray(queries) ? 'array' : typeof queries, len: Array.isArray(queries) ? queries.length : undefined });

  const safeFormatDate = (value: any, fmt = "PPp") => {
    if (!value) return "";
    try {
      if (typeof value === "object" && typeof value.toDate === "function") {
        const d = value.toDate();
        if (isNaN(d.getTime())) return "";
        return format(d, fmt);
      }
      if (typeof value === "number") {
        const ms = value < 1e12 ? value * 1000 : value;
        const d = new Date(ms);
        if (isNaN(d.getTime())) return "";
        return format(d, fmt);
      }
      const d = new Date(String(value));
      if (isNaN(d.getTime())) return "";
      return format(d, fmt);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("safeFormatDate parse failed for", value, e);
      return "";
    }
  };

  const startAnswer = (q: QueryItem) => {
    setAnsweringId(q._id ?? q.id);
    setAnswerText(q.reply ?? q.answer ?? "");
  };

  const cancelAnswer = () => {
    setAnsweringId(null);
    setAnswerText("");
  };

  const submitAnswer = async () => {
    if (!answeringId) return;
    if (!answerText.trim()) {
      toast({ title: "Validation", description: "Please enter an answer.", variant: "destructive" });
      return;
    }
    try {
      // Use 'reply' and 'status: "responded"' to match the server handlers used elsewhere
      await queriesAPI.update(answeringId, { reply: answerText.trim(), status: "responded" });
      toast({ title: "Saved", description: "Answer saved." });
      setAnsweringId(null);
      setAnswerText("");
      onRefetch?.();
    } catch (err: any) {
      if (err?.status === 409 || err?.response?.status === 409) {
        toast({ title: "Already answered", description: err?.data?.error ?? "This query was already answered.", variant: "destructive" });
      } else {
        toast({ title: "Error", description: err?.message ?? "Failed to save answer.", variant: "destructive" });
      }
    }
  };

  // normalize incoming prop: support either array or { items, ... }
  const list = Array.isArray(queries) ? queries : (queries?.items ?? []);

  return (
    <div className="space-y-3">
      {list.length === 0 ? <div className="text-sm text-muted-foreground">No queries yet.</div> :
        list.map((q: QueryItem) => {
          const id = q._id ?? q.id ?? JSON.stringify(q);
          const isAnswering = answeringId === id;
          const answered = (q.status && (String(q.status).toLowerCase() === "responded" || String(q.status).toLowerCase() === "resolved")) || !!q.reply;

          const studentLabel = q.studentName ?? (q.student && (q.student.fullName ?? q.student.name)) ?? String(q.studentId ?? q.student ?? "").slice(0, 8) ?? "Student";
          const courseLabel = q.courseTitle ?? q.course ?? "General";
          const message = q.message ?? q.query ?? q.text ?? "";
          const createdRaw = q.createdAt ?? q.created_at ?? q.created ?? q.timestamp ?? null;

          return (
            <div key={id} className="p-3 border rounded bg-background">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <strong>{studentLabel}</strong>
                    <span className="text-xs text-muted-foreground">• {courseLabel}</span>
                    <span className="ml-2 text-xs px-2 py-0.5 rounded bg-muted/50">{q.status ?? "open"}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{message}</p>

                  {(q.reply) && (
                    <div className="mt-2 p-2 bg-muted/20 rounded text-sm">
                      <strong>Answer:</strong>
                      <div className="whitespace-pre-wrap">{q.reply}</div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground mt-2">{safeFormatDate(createdRaw)}</div>
                </div>

                <div className="flex flex-col gap-2">
                  {!answered && !isAnswering && (
                    <Button size="sm" onClick={() => startAnswer(q)}>Reply</Button>
                  )}

                  {answered && <Button size="sm" variant="outline" disabled>Answered</Button>}
                </div>
              </div>

              {isAnswering && (
                <div className="mt-3 space-y-2">
                  <textarea className="w-full rounded-md border p-2" rows={3} value={answerText} onChange={(e) => setAnswerText(e.target.value)} />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={cancelAnswer}>Cancel</Button>
                    <Button onClick={submitAnswer}>Save Answer</Button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      }
    </div>
  );
}
