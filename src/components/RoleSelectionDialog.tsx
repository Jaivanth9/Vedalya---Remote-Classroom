import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, BookOpen, Shield } from "lucide-react";
import { authAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface RoleSelectionDialogProps {
  open: boolean;
  onRoleSelected: (role: string) => void;
}

export const RoleSelectionDialog = ({ open, onRoleSelected }: RoleSelectionDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleRoleSelection = async (role: 'student' | 'teacher' | 'admin') => {
    setIsSubmitting(true);
    try {
      await authAPI.updateRole(role);

      toast({
        title: "Success!",
        description: "Your role has been set successfully.",
      });

      onRoleSelected(role);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles = [
    {
      value: 'student' as const,
      icon: User,
      title: 'Student',
      description: 'Access courses, attend classes, and track your learning progress',
    },
    {
      value: 'teacher' as const,
      icon: BookOpen,
      title: 'Teacher',
      description: 'Create courses, manage classes, and guide students',
    },
    {
      value: 'admin' as const,
      icon: Shield,
      title: 'Admin',
      description: 'Manage platform, oversee users, and monitor activities',
    },
  ];

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>Select Your Role</DialogTitle>
          <DialogDescription>
            Choose how you'll be using Aकlya. This will personalize your experience.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Button
                key={role.value}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2 hover:border-primary hover:bg-primary/5"
                onClick={() => handleRoleSelection(role.value)}
                disabled={isSubmitting}
              >
                <div className="flex items-center gap-2 w-full">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{role.title}</span>
                </div>
                <p className="text-sm text-muted-foreground text-left">
                  {role.description}
                </p>
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};