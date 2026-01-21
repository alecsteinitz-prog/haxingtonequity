import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { LearningPath, LearningModule } from './types';
import { LessonCard } from './LessonCard';
import { LessonViewer } from './LessonViewer';

interface LearningPathViewProps {
  path: LearningPath;
  completedModules: string[];
  onComplete: (moduleId: string) => void;
  onBack: () => void;
  onReset: () => void;
  onOpenGlossary: (termId: string) => void;
}

export const LearningPathView = ({ 
  path, 
  completedModules, 
  onComplete, 
  onBack,
  onReset,
  onOpenGlossary
}: LearningPathViewProps) => {
  const [activeModule, setActiveModule] = useState<LearningModule | null>(null);
  
  const completionPercentage = Math.round((completedModules.length / path.modules.length) * 100);
  
  // Find the first incomplete module
  const currentModuleIndex = path.modules.findIndex(m => !completedModules.includes(m.id));
  
  const handleModuleComplete = () => {
    if (activeModule) {
      onComplete(activeModule.id);
      setActiveModule(null);
    }
  };

  if (activeModule) {
    return (
      <LessonViewer
        module={activeModule}
        onComplete={handleModuleComplete}
        onBack={() => setActiveModule(null)}
        onOpenGlossary={onOpenGlossary}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{path.icon}</span>
            <h2 className="text-2xl font-bold text-foreground">{path.name}</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{path.description}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-3 bg-card rounded-xl p-5 border border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            Your Progress
          </span>
          <span className="text-sm font-bold text-primary">
            {completedModules.length} of {path.modules.length} lessons
          </span>
        </div>
        <Progress value={completionPercentage} className="h-3" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{completionPercentage}% complete</span>
          {completedModules.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive"
              onClick={onReset}
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset Progress
            </Button>
          )}
        </div>
      </div>

      {/* Lessons List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Lessons</h3>
        <div className="space-y-3">
          {path.modules.map((module, index) => {
            const isCompleted = completedModules.includes(module.id);
            const isCurrent = index === currentModuleIndex;
            const isLocked = index > currentModuleIndex && currentModuleIndex !== -1;
            
            return (
              <LessonCard
                key={module.id}
                module={module}
                index={index}
                isCompleted={isCompleted}
                isCurrent={isCurrent}
                isLocked={isLocked}
                onClick={() => setActiveModule(module)}
              />
            );
          })}
        </div>
      </div>

      {/* Completion Message */}
      {completionPercentage === 100 && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-center space-y-3">
          <span className="text-4xl">🎉</span>
          <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
            Path Completed!
          </h3>
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            Congratulations! You've completed all lessons in the {path.name} path.
          </p>
          <Button variant="outline" onClick={onBack} className="mt-4">
            Explore Other Paths
          </Button>
        </div>
      )}
    </div>
  );
};
