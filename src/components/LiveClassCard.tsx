import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Calendar, Clock, Download } from "lucide-react";
import { format } from "date-fns";

interface LiveClassCardProps {
  classData: {
    id: string;
    title: string;
    description: string;
    class_type: string;
    scheduled_at: string;
    video_url?: string;
    transcript?: string;
    is_downloadable: boolean;
    status: string;
  };
  onJoin?: (id: string) => void;
  onWatch?: (id: string) => void;
  onDownload?: (id: string) => void;
}

export const LiveClassCard = ({ classData, onJoin, onWatch, onDownload }: LiveClassCardProps) => {
  const isLive = classData.class_type === 'live';
  const statusColors = {
    scheduled: 'bg-blue-500',
    ongoing: 'bg-green-500',
    completed: 'bg-gray-500',
    cancelled: 'bg-red-500',
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              {classData.title}
            </CardTitle>
            <CardDescription className="mt-2">{classData.description}</CardDescription>
          </div>
          <Badge className={statusColors[classData.status as keyof typeof statusColors]}>
            {classData.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(classData.scheduled_at), "PPP")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{format(new Date(classData.scheduled_at), "p")}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {isLive && classData.status === 'ongoing' && (
            <Button onClick={() => onJoin?.(classData.id)} className="flex-1">
              Join Live Class
            </Button>
          )}
          {!isLive && classData.video_url && (
            <Button onClick={() => onWatch?.(classData.id)} className="flex-1">
              Watch Recording
            </Button>
          )}
          {classData.is_downloadable && classData.video_url && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDownload?.(classData.id)}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>

        {classData.transcript && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-xs font-semibold mb-2">Transcript Available</p>
            <p className="text-xs text-muted-foreground line-clamp-3">
              {classData.transcript}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};