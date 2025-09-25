import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
}

interface InteractiveGlossaryProps {
  terms: GlossaryTerm[];
  className?: string;
}

export const InteractiveGlossary = ({ terms, className }: InteractiveGlossaryProps) => {
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleTermClick = (term: GlossaryTerm) => {
    setSelectedTerm(term);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedTerm(null);
  };

  return (
    <>
      <div className={`flex flex-wrap gap-3 ${className}`}>
        {terms.map((term) => (
          <Badge
            key={term.id}
            variant="secondary"
            className="text-sm px-4 py-2 font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-200 cursor-pointer transform hover:scale-105 shadow-sm"
            onClick={() => handleTermClick(term)}
          >
            {term.term}
          </Badge>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md mx-4 rounded-lg shadow-xl border-0 bg-card">
          <DialogHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-foreground pr-8">
                {selectedTerm?.term}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full hover:bg-muted"
                onClick={closeDialog}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {selectedTerm?.definition}
            </p>
            
            {selectedTerm?.category && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Category:
                </span>
                <Badge variant="outline" className="text-xs">
                  {selectedTerm.category.charAt(0).toUpperCase() + selectedTerm.category.slice(1)}
                </Badge>
              </div>
            )}
          </div>
          
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={closeDialog} className="text-sm">
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};