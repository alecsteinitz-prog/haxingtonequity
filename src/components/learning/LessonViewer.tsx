import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, CheckCircle2, Lightbulb, BookOpen, MessageSquare } from 'lucide-react';
import { LearningModule, LessonContent } from './types';
import { cn } from '@/lib/utils';

interface LessonViewerProps {
  module: LearningModule;
  onComplete: () => void;
  onBack: () => void;
  onOpenGlossary: (termId: string) => void;
}

export const LessonViewer = ({ module, onComplete, onBack, onOpenGlossary }: LessonViewerProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = module.content.length;

  const getContentIcon = (type: LessonContent['type']) => {
    switch (type) {
      case 'text': return <BookOpen className="w-5 h-5" />;
      case 'tip': return <Lightbulb className="w-5 h-5" />;
      case 'example': return <MessageSquare className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const getContentStyle = (type: LessonContent['type']) => {
    switch (type) {
      case 'tip': return 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-100';
      case 'example': return 'bg-blue-500/10 border-blue-500/30 text-blue-900 dark:text-blue-100';
      default: return 'bg-card border-border';
    }
  };

  const getContentLabel = (type: LessonContent['type']) => {
    switch (type) {
      case 'tip': return 'Pro Tip';
      case 'example': return 'Real-World Example';
      default: return 'Lesson';
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentContent = module.content[currentStep];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-foreground">{module.title}</h2>
          <p className="text-sm text-muted-foreground">{module.description}</p>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center justify-center gap-2">
        {module.content.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentStep(index)}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-200",
              index === currentStep
                ? "bg-primary scale-125" 
                : index < currentStep 
                  ? "bg-primary/50" 
                  : "bg-muted hover:bg-muted-foreground/30"
            )}
          />
        ))}
      </div>

      {/* Content Card */}
      <Card className={cn("border-2 transition-all duration-300", getContentStyle(currentContent.type))}>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              currentContent.type === 'tip' && "bg-amber-500/20",
              currentContent.type === 'example' && "bg-blue-500/20",
              currentContent.type === 'text' && "bg-primary/10"
            )}>
              {getContentIcon(currentContent.type)}
            </div>
            <div>
              <Badge variant="outline" className="text-xs">
                {getContentLabel(currentContent.type)}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                Step {currentStep + 1} of {totalSteps}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed">
            {currentContent.content}
          </p>
        </CardContent>
      </Card>

      {/* Related Terms */}
      {module.relatedTerms.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Related Terms:</p>
          <div className="flex flex-wrap gap-2">
            {module.relatedTerms.map((termId) => (
              <Badge
                key={termId}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => onOpenGlossary(termId)}
              >
                {termId.replace('-', ' ').toUpperCase()}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>
        
        <Button
          onClick={handleNext}
          className="gap-2"
        >
          {currentStep === totalSteps - 1 ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Complete Lesson
            </>
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
