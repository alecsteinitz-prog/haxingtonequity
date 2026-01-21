import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, Lock, Play } from 'lucide-react';
import { LearningModule } from './types';
import { cn } from '@/lib/utils';

interface LessonCardProps {
  module: LearningModule;
  index: number;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  onClick: () => void;
}

export const LessonCard = ({ 
  module, 
  index, 
  isCompleted, 
  isCurrent, 
  isLocked, 
  onClick 
}: LessonCardProps) => {
  return (
    <Card 
      className={cn(
        "transition-all duration-300 cursor-pointer border-2",
        isCompleted && "border-emerald-500/50 bg-emerald-500/5",
        isCurrent && "border-primary shadow-lg ring-2 ring-primary/20",
        isLocked && "opacity-60 cursor-not-allowed",
        !isCompleted && !isCurrent && !isLocked && "hover:border-primary/30 hover:shadow-md"
      )}
      onClick={() => !isLocked && onClick()}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Status Icon */}
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
              isCompleted && "bg-emerald-500 text-primary-foreground",
              isCurrent && "bg-primary text-primary-foreground",
              isLocked && "bg-muted text-muted-foreground",
              !isCompleted && !isCurrent && !isLocked && "bg-secondary text-secondary-foreground"
            )}>
              {isCompleted ? (
                <Check className="w-5 h-5" />
              ) : isLocked ? (
                <Lock className="w-4 h-4" />
              ) : isCurrent ? (
                <Play className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            
            <div className="flex-1">
              <CardTitle className={cn(
                "text-base font-semibold",
                isLocked && "text-muted-foreground"
              )}>
                {module.title}
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                {module.description}
              </CardDescription>
            </div>
          </div>
          
          {/* Duration Badge */}
          <Badge variant="outline" className="shrink-0 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {module.duration}
          </Badge>
        </div>
      </CardHeader>
      
      {isCurrent && (
        <CardContent className="pt-0">
          <div className="flex items-center gap-2 text-sm text-primary font-medium">
            <Play className="w-4 h-4" />
            Continue Learning
          </div>
        </CardContent>
      )}
    </Card>
  );
};
