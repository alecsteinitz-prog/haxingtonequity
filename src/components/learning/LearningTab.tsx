import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, BookOpen } from 'lucide-react';
import { LearningPathSelector } from './LearningPathSelector';
import { LearningPathView } from './LearningPathView';
import { FundingGlossary } from './FundingGlossary';
import { learningPaths, fundingGlossary } from './learningData';
import { UserProgress } from './types';

const STORAGE_KEY = 'learning_progress';

export const LearningTab = () => {
  const [activeTab, setActiveTab] = useState<'paths' | 'glossary'>('paths');
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [glossaryTermId, setGlossaryTermId] = useState<string | null>(null);

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserProgress(parsed.progress || []);
        // Don't auto-select path, let user choose
      } catch (e) {
        console.error('Failed to parse learning progress:', e);
      }
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    if (userProgress.length > 0 || selectedPathId) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        progress: userProgress,
        lastPathId: selectedPathId
      }));
    }
  }, [userProgress, selectedPathId]);

  const handleSelectPath = (pathId: string) => {
    setSelectedPathId(pathId);
    
    // Initialize progress for this path if not exists
    if (!userProgress.find(p => p.pathId === pathId)) {
      setUserProgress(prev => [...prev, {
        pathId,
        completedModules: [],
      }]);
    }
  };

  const handleCompleteModule = (moduleId: string) => {
    if (!selectedPathId) return;
    
    setUserProgress(prev => prev.map(p => {
      if (p.pathId === selectedPathId) {
        const newCompleted = p.completedModules.includes(moduleId)
          ? p.completedModules
          : [...p.completedModules, moduleId];
        return { ...p, completedModules: newCompleted };
      }
      return p;
    }));
  };

  const handleResetProgress = () => {
    if (!selectedPathId) return;
    
    setUserProgress(prev => prev.map(p => {
      if (p.pathId === selectedPathId) {
        return { ...p, completedModules: [] };
      }
      return p;
    }));
  };

  const handleOpenGlossary = (termId: string) => {
    setGlossaryTermId(termId);
    setActiveTab('glossary');
  };

  const handleNavigateToLesson = (lessonId: string) => {
    // Find which path contains this lesson
    const path = learningPaths.find(p => p.modules.some(m => m.id === lessonId));
    if (path) {
      setSelectedPathId(path.id);
      setActiveTab('paths');
    }
  };

  const selectedPath = selectedPathId 
    ? learningPaths.find(p => p.id === selectedPathId) 
    : null;
  
  const currentProgress = selectedPathId 
    ? userProgress.find(p => p.pathId === selectedPathId) 
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Learning Center</h1>
        <p className="text-muted-foreground">
          Master real estate funding with interactive lessons and essential terms
        </p>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'paths' | 'glossary')}>
        <TabsList className="grid w-full grid-cols-2 h-12">
          <TabsTrigger value="paths" className="flex items-center gap-2 text-sm">
            <GraduationCap className="w-4 h-4" />
            Learning Paths
          </TabsTrigger>
          <TabsTrigger value="glossary" className="flex items-center gap-2 text-sm">
            <BookOpen className="w-4 h-4" />
            Funding Glossary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="paths" className="mt-6">
          {!selectedPath ? (
            <LearningPathSelector 
              paths={learningPaths} 
              onSelectPath={handleSelectPath}
            />
          ) : (
            <LearningPathView
              path={selectedPath}
              completedModules={currentProgress?.completedModules || []}
              onComplete={handleCompleteModule}
              onBack={() => setSelectedPathId(null)}
              onReset={handleResetProgress}
              onOpenGlossary={handleOpenGlossary}
            />
          )}
        </TabsContent>

        <TabsContent value="glossary" className="mt-6">
          <FundingGlossary 
            terms={fundingGlossary}
            selectedTermId={glossaryTermId}
            onClose={() => setGlossaryTermId(null)}
            onNavigateToLesson={handleNavigateToLesson}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
