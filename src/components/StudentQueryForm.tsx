// src/components/StudentQueryForm.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { queriesAPI, authAPI } from "@/lib/api";

interface Props {
  courseId?: string;
  courseTitle?: string;
  onSuccess?: () => void;
}

export default function StudentQueryForm({ courseId, courseTitle, onSuccess }: Props) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim()) {
      toast({ title: "Validation", description: "Enter your question.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      // get current user to include studentId (backend expects it)
      const me = await authAPI.getCurrentUser();
      const studentId = me?.user?.id || me?.user?._id || me?.user?.userId;
      if (!studentId) {
        toast({ title: "Not signed in", description: "Please sign in to submit a query.", variant: "destructive" });
        setLoading(false);
        return;
      }

      await queriesAPI.create({
        studentId,
        courseId,
        courseTitle,
        subject: subject || undefined,
        message: message.trim(),
      });

      toast({ title: "Sent", description: "Your query was submitted." });
      setSubject("");
      setMessage("");
      onSuccess?.();
    } catch (err: any) {
      if (err?.status === 409 || err?.response?.status === 409) {
        toast({ title: "Already Submitted", description: err?.data?.error ?? "You already have an open query.", variant: "destructive" });
      } else {
        toast({ title: "Error", description: err?.message ?? "Failed to submit query.", variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input placeholder="Subject (optional)" value={subject} onChange={(e) => setSubject(e.target.value)} />
      <Textarea rows={4} placeholder="Ask your question..." value={message} onChange={(e) => setMessage(e.target.value)} />
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>{loading ? "Sending..." : "Send Query"}</Button>
      </div>
    </form>
  );
}
