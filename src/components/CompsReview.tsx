import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  Home, 
  DollarSign, 
  TrendingUp, 
  Edit2, 
  Save, 
  Trash2,
  Plus,
  Activity
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { calculateAllScores } from "@/utils/scoringCalculations";

interface Comp {
  id: string;
  address: string;
  sqft: string;
  price: string;
  status: 'active' | 'pending' | 'sold';
}

interface CompsReviewProps {
  dealAnalysisId?: string;
  formData: any;
  originalScore: number;
  onScoreUpdate?: (newScore: number) => void;
}

export const CompsReview = ({ dealAnalysisId, formData, originalScore, onScoreUpdate }: CompsReviewProps) => {
  const [comps, setComps] = useState<Comp[]>([
    {
      id: '1',
      address: '123 Main St',
      sqft: '1,800',
      price: '$450,000',
      status: 'sold'
    },
    {
      id: '2',
      address: '456 Oak Ave',
      sqft: '2,100',
      price: '$525,000',
      status: 'pending'
    },
    {
      id: '3',
      address: '789 Pine Rd',
      sqft: '1,950',
      price: '$485,000',
      status: 'active'
    }
  ]);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    active: true,
    pending: true,
    sold: true
  });
  const [adjustedARV, setAdjustedARV] = useState(formData?.arv_estimate || '');
  const [confidence, setConfidence] = useState(75);
  const [recalculatedScore, setRecalculatedScore] = useState(originalScore);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Recalculate score when ARV changes
    if (adjustedARV && adjustedARV !== formData?.arv_estimate) {
      const updatedFormData = {
        ...formData,
        arv_estimate: adjustedARV
      };
      const scores = calculateAllScores(updatedFormData);
      setRecalculatedScore(scores.overall);
    } else {
      setRecalculatedScore(originalScore);
    }
  }, [adjustedARV, formData, originalScore]);

  const handleEditComp = (id: string) => {
    setEditingId(id);
  };

  const handleSaveComp = (id: string) => {
    setEditingId(null);
    toast.success("Comparable updated");
  };

  const handleDeleteComp = (id: string) => {
    setComps(comps.filter(c => c.id !== id));
    toast.success("Comparable removed");
  };

  const handleAddComp = () => {
    const newComp: Comp = {
      id: Date.now().toString(),
      address: '',
      sqft: '',
      price: '',
      status: 'active'
    };
    setComps([...comps, newComp]);
    setEditingId(newComp.id);
  };

  const handleCompChange = (id: string, field: keyof Comp, value: string) => {
    setComps(comps.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleSaveAdjustments = async () => {
    if (!dealAnalysisId) {
      toast.error("No analysis ID available");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('deal_analyses')
        .update({
          comps_data: comps as any,
          adjusted_arv: adjustedARV,
          adjusted_score: recalculatedScore,
          comps_confidence: confidence
        })
        .eq('id', dealAnalysisId);

      if (error) throw error;

      toast.success("Adjustments saved to Analysis History");
      if (onScoreUpdate) {
        onScoreUpdate(recalculatedScore);
      }
    } catch (error) {
      console.error('Error saving adjustments:', error);
      toast.error("Failed to save adjustments");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredComps = comps.filter(comp => filters[comp.status]);

  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return "text-success";
    if (conf >= 60) return "text-warning";
    return "text-destructive";
  };

  const getConfidenceLabel = (conf: number) => {
    if (conf >= 80) return "High Confidence";
    if (conf >= 60) return "Moderate Confidence";
    return "Low Confidence";
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Confidence Meter */}
      <Card className="shadow-card border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-primary" />
              <div>
                <h3 className="font-semibold text-lg">Comps Confidence Meter</h3>
                <p className="text-sm text-muted-foreground">Reliability of this analysis</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${getConfidenceColor(confidence)}`}>
                {confidence}%
              </div>
              <Badge variant={confidence >= 80 ? "default" : confidence >= 60 ? "secondary" : "destructive"}>
                {getConfidenceLabel(confidence)}
              </Badge>
            </div>
          </div>
          <Progress value={confidence} className="h-3" />
          <div className="mt-4">
            <Label className="text-xs text-muted-foreground">Adjust Confidence Level</Label>
            <Slider
              value={[confidence]}
              onValueChange={(value) => setConfidence(value[0])}
              min={0}
              max={100}
              step={5}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* ARV Adjustment */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            ARV Adjustments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Original ARV</Label>
              <Input
                value={formData?.arv_estimate || 'N/A'}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <Label>Adjusted ARV</Label>
              <Input
                value={adjustedARV}
                onChange={(e) => setAdjustedARV(e.target.value)}
                placeholder="Enter adjusted ARV"
              />
            </div>
          </div>
          
          {adjustedARV !== formData?.arv_estimate && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Recalculated Feasibility Score</span>
                <Badge variant={recalculatedScore >= 80 ? "default" : "secondary"}>
                  {recalculatedScore}%
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Original: {originalScore}%</span>
                <span className={recalculatedScore > originalScore ? "text-success" : "text-destructive"}>
                  {recalculatedScore > originalScore ? "↑" : "↓"} {Math.abs(recalculatedScore - originalScore)}%
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            Comparable Sales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6 pb-4 border-b">
            <Label className="text-sm font-medium">Filters:</Label>
            <div className="flex items-center gap-2">
              <Switch
                checked={filters.active}
                onCheckedChange={(checked) => setFilters({ ...filters, active: checked })}
              />
              <Label className="text-sm">Active</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={filters.pending}
                onCheckedChange={(checked) => setFilters({ ...filters, pending: checked })}
              />
              <Label className="text-sm">Pending</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={filters.sold}
                onCheckedChange={(checked) => setFilters({ ...filters, sold: checked })}
              />
              <Label className="text-sm">Sold</Label>
            </div>
          </div>

          {/* Comps Table */}
          <div className="space-y-3">
            {filteredComps.map((comp) => (
              <div
                key={comp.id}
                className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
              >
                {editingId === comp.id ? (
                  <div className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-4">
                      <div className="md:col-span-2">
                        <Label className="text-xs">Address</Label>
                        <Input
                          value={comp.address}
                          onChange={(e) => handleCompChange(comp.id, 'address', e.target.value)}
                          placeholder="123 Main St"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Square Footage</Label>
                        <Input
                          value={comp.sqft}
                          onChange={(e) => handleCompChange(comp.id, 'sqft', e.target.value)}
                          placeholder="1,800"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Price</Label>
                        <Input
                          value={comp.price}
                          onChange={(e) => handleCompChange(comp.id, 'price', e.target.value)}
                          placeholder="$450,000"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Status:</Label>
                      <select
                        value={comp.status}
                        onChange={(e) => handleCompChange(comp.id, 'status', e.target.value as any)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="sold">Sold</option>
                      </select>
                      <Button
                        size="sm"
                        onClick={() => handleSaveComp(comp.id)}
                        className="ml-auto"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{comp.address || 'New Comp'}</h4>
                        <Badge variant={
                          comp.status === 'sold' ? 'default' : 
                          comp.status === 'pending' ? 'secondary' : 
                          'outline'
                        }>
                          {comp.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{comp.sqft} sqft</span>
                        <span className="text-primary font-medium">{comp.price}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditComp(comp.id)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteComp(comp.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={handleAddComp}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Comparable
          </Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Card className="shadow-premium bg-gradient-subtle border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Save Your Adjustments</h3>
              <p className="text-sm text-muted-foreground">
                Changes will be saved to your Analysis History
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleSaveAdjustments}
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Adjustments"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};