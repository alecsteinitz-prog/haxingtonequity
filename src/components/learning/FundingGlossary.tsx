import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Search, BookOpen, Lightbulb, Tag } from 'lucide-react';
import { GlossaryTerm } from './types';
import { cn } from '@/lib/utils';

interface FundingGlossaryProps {
  terms: GlossaryTerm[];
  selectedTermId?: string | null;
  onClose?: () => void;
  onNavigateToLesson?: (lessonId: string) => void;
}

export const FundingGlossary = ({ 
  terms, 
  selectedTermId, 
  onClose,
  onNavigateToLesson 
}: FundingGlossaryProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(
    selectedTermId ? terms.find(t => t.id === selectedTermId) || null : null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(!!selectedTermId);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(terms.map(t => t.category))];
    return cats.sort();
  }, [terms]);

  // Filter terms based on search
  const filteredTerms = useMemo(() => {
    if (!searchQuery.trim()) return terms;
    const query = searchQuery.toLowerCase();
    return terms.filter(term => 
      term.term.toLowerCase().includes(query) ||
      term.definition.toLowerCase().includes(query) ||
      term.category.toLowerCase().includes(query)
    );
  }, [terms, searchQuery]);

  // Group by category
  const groupedTerms = useMemo(() => {
    const groups: Record<string, GlossaryTerm[]> = {};
    filteredTerms.forEach(term => {
      if (!groups[term.category]) {
        groups[term.category] = [];
      }
      groups[term.category].push(term);
    });
    return groups;
  }, [filteredTerms]);

  const handleTermClick = (term: GlossaryTerm) => {
    setSelectedTerm(term);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedTerm(null);
    onClose?.();
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search terms (e.g., DSCR, Bridge Loan)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>

      {/* Terms Grid */}
      {Object.entries(groupedTerms).map(([category, categoryTerms]) => (
        <div key={category} className="space-y-4">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {category}
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {categoryTerms.map((term) => (
              <Badge
                key={term.id}
                variant="secondary"
                className={cn(
                  "text-sm px-4 py-2 font-medium cursor-pointer transition-all duration-200",
                  "hover:bg-primary hover:text-primary-foreground hover:scale-105 shadow-sm"
                )}
                onClick={() => handleTermClick(term)}
              >
                {term.term}
              </Badge>
            ))}
          </div>
        </div>
      ))}

      {filteredTerms.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No terms found matching "{searchQuery}"</p>
        </div>
      )}

      {/* Term Detail Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg mx-4 rounded-xl shadow-2xl border-0 bg-card overflow-hidden">
          <DialogHeader className="pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-foreground">
                  {selectedTerm?.term}
                </DialogTitle>
                <Badge variant="outline" className="mt-1">
                  {selectedTerm?.category}
                </Badge>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Definition */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Definition
              </h4>
              <p className="text-foreground leading-relaxed">
                {selectedTerm?.definition}
              </p>
            </div>
            
            {/* Example */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-accent-foreground" />
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Real-World Example
                </h4>
              </div>
              <Card className="bg-accent/30 border-accent/50">
                <CardContent className="p-4">
                  <p className="text-foreground leading-relaxed">
                    {selectedTerm?.example}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Related Lessons */}
            {selectedTerm?.relatedLessons && selectedTerm.relatedLessons.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Learn More
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTerm.relatedLessons.map((lessonId) => (
                    <Button
                      key={lessonId}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        onNavigateToLesson?.(lessonId);
                        handleCloseDialog();
                      }}
                    >
                      Go to Lesson →
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end pt-4 border-t border-border">
            <Button variant="outline" onClick={handleCloseDialog}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
