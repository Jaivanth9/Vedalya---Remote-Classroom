import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { notesAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Save, Trash2, Edit } from "lucide-react";
import { z } from "zod";

const noteSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  content: z.string().trim().min(1, "Content is required").max(50000, "Content must be less than 50000 characters"),
});

interface Note {
  id: string;
  title: string;
  content: string;
  note_type: string;
  created_at: string;
}

interface NotesEditorProps {
  notes: Note[];
  onRefresh: () => void;
  courseId?: string;
  classId?: string;
}

export const NotesEditor = ({ notes, onRefresh, courseId, classId }: NotesEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [noteType, setNoteType] = useState<string>("learning");
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSave = async () => {
    // Validate input
    const validation = noteSchema.safeParse({ title, content });

    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingNote) {
        await notesAPI.update(editingNote.id, {
          title: validation.data.title,
          content: validation.data.content,
          noteType,
          courseId: courseId || null,
          classId: classId || null,
        });
        toast({ title: "Note updated successfully" });
      } else {
        await notesAPI.create({
          title: validation.data.title,
          content: validation.data.content,
          noteType,
          courseId: courseId || null,
          classId: classId || null,
        });
        toast({ title: "Note created successfully" });
      }

      setTitle("");
      setContent("");
      setNoteType("learning");
      setIsEditing(false);
      setEditingNote(null);
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setNoteType(note.note_type);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await notesAPI.delete(id);
      toast({ title: "Note deleted successfully" });
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingNote ? t('notes.edit') : t('notes.create')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder={t('notes.noteTitle')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />
          <Select value={noteType} onValueChange={setNoteType}>
            <SelectTrigger>
              <SelectValue placeholder={t('notes.selectType')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="teaching">{t('notes.teachingNotes')}</SelectItem>
              <SelectItem value="learning">{t('notes.learningNotes')}</SelectItem>
              <SelectItem value="revision">{t('notes.revisionNotes')}</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            placeholder={t('notes.writeNotes')}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={50000}
            rows={6}
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={!title || !content}>
              <Save className="h-4 w-4 mr-2" />
              {editingNote ? t('notes.update') : t('notes.saveNote')}
            </Button>
            {editingNote && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingNote(null);
                  setTitle("");
                  setContent("");
                  setNoteType("learning");
                  setIsEditing(false);
                }}
              >
                {t('common.cancel')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {notes.map((note) => (
          <Card key={note.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{note.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {note.note_type} • {new Date(note.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(note)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(note.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{note.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};