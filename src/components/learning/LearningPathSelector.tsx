import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { LearningPath } from './types';

interface LearningPathSelectorProps {
  paths: LearningPath[];
  onSelectPath: (pathId: string) => void;
}

export const LearningPathSelector = ({ paths, onSelectPath }: LearningPathSelectorProps) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 py-6">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Choose Your Learning Path
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Select the path that matches your goals. You can always switch or explore other paths later.
        </p>
      </div>

      {/* Path Cards */}
      <div className="grid gap-6">
        {paths.map((path) => (
          <Card 
            key={path.id}
            className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/50"
            onClick={() => onSelectPath(path.id)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{path.icon}</span>
                  <div>
                    <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
                      {path.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mt-1">
                      {path.modules.length} lessons
                    </CardDescription>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {path.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {path.modules.slice(0, 3).map((module) => (
                  <span 
                    key={module.id}
                    className="text-xs px-3 py-1 bg-secondary rounded-full text-secondary-foreground"
                  >
                    {module.title}
                  </span>
                ))}
                {path.modules.length > 3 && (
                  <span className="text-xs px-3 py-1 bg-secondary rounded-full text-secondary-foreground">
                    +{path.modules.length - 3} more
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Skip Option */}
      <div className="text-center pt-4">
        <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
          Skip for now — Browse all content
        </Button>
      </div>
    </div>
  );
};
