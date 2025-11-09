import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Shield, AlertTriangle, CheckCircle, MessageSquare, Eye, EyeOff } from "lucide-react";

export const AdminDashboard = () => {
  const [validationLogs, setValidationLogs] = useState<any[]>([]);
  const [feedbackSubmissions, setFeedbackSubmissions] = useState<any[]>([]);
  const [dataReviewMode, setDataReviewMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Load validation logs
      const { data: logs, error: logsError } = await supabase
        .from('validation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;
      setValidationLogs(logs || []);

      // Load feedback submissions
      const { data: feedback, error: feedbackError } = await supabase
        .from('feedback_submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (feedbackError) throw feedbackError;
      setFeedbackSubmissions(feedback || []);

      // Load admin settings
      const { data: settings } = await supabase
        .from('admin_settings')
        .select('data_review_mode')
        .eq('user_id', user?.id)
        .single();

      if (settings) {
        setDataReviewMode(settings.data_review_mode);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const toggleDataReviewMode = async (enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          user_id: user?.id,
          data_review_mode: enabled
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setDataReviewMode(enabled);
      toast.success(`Data Review Mode ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error toggling data review mode:', error);
      toast.error("Failed to update settings");
    }
  };

  const updateFeedbackStatus = async (feedbackId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('feedback_submissions')
        .update({ status: newStatus })
        .eq('id', feedbackId);

      if (error) throw error;

      setFeedbackSubmissions(prev =>
        prev.map(f => f.id === feedbackId ? { ...f, status: newStatus } : f)
      );
      toast.success("Status updated");
    } catch (error) {
      console.error('Error updating feedback status:', error);
      toast.error("Failed to update status");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      high: "destructive",
      medium: "default",
      low: "secondary"
    } as const;
    return <Badge variant={variants[severity as keyof typeof variants] || "secondary"}>{severity}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Quality Assurance & Monitoring</p>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="review-mode" className="flex items-center gap-2">
            {dataReviewMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            Data Review Mode
          </Label>
          <Switch
            id="review-mode"
            checked={dataReviewMode}
            onCheckedChange={toggleDataReviewMode}
          />
        </div>
      </div>

      <Tabs defaultValue="validation" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="validation">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Validation Logs ({validationLogs.length})
          </TabsTrigger>
          <TabsTrigger value="feedback">
            <MessageSquare className="w-4 h-4 mr-2" />
            User Feedback ({feedbackSubmissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="validation" className="space-y-4">
          {validationLogs.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No validation logs yet
              </CardContent>
            </Card>
          ) : (
            validationLogs.map((log) => (
              <Card key={log.id} className={!dataReviewMode && log.validation_status !== 'passed' ? 'hidden' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(log.validation_status)}
                      <CardTitle className="text-lg">
                        {log.analysis_type.replace('_', ' ').toUpperCase()}
                      </CardTitle>
                      <Badge variant={log.validation_status === 'passed' ? 'default' : 'destructive'}>
                        {log.validation_status}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  <CardDescription>Analysis ID: {log.analysis_id}</CardDescription>
                </CardHeader>
                {log.issues && log.issues.length > 0 && (
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Issues Found:</h4>
                      {log.issues.map((issue: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 p-2 bg-muted rounded">
                          {getSeverityBadge(issue.severity)}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{issue.field}</p>
                            <p className="text-xs text-muted-foreground">{issue.issue}</p>
                            {issue.details && (
                              <p className="text-xs text-muted-foreground mt-1">{issue.details}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          {feedbackSubmissions.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No feedback submissions yet
              </CardContent>
            </Card>
          ) : (
            feedbackSubmissions.map((feedback) => (
              <Card key={feedback.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg capitalize">
                        {feedback.feedback_type.replace('_', ' ')}
                      </CardTitle>
                      <Badge variant={
                        feedback.status === 'resolved' ? 'default' :
                        feedback.status === 'reviewed' ? 'secondary' : 'outline'
                      }>
                        {feedback.status}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(feedback.created_at).toLocaleString()}
                    </span>
                  </div>
                  {feedback.analysis_id && (
                    <CardDescription>Analysis ID: {feedback.analysis_id}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm whitespace-pre-wrap">{feedback.notes}</p>
                  </div>
                  
                  {feedback.screenshot_url && (
                    <div>
                      <a
                        href={feedback.screenshot_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        View Screenshot
                      </a>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateFeedbackStatus(feedback.id, 'reviewed')}
                      disabled={feedback.status === 'reviewed'}
                    >
                      Mark as Reviewed
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateFeedbackStatus(feedback.id, 'resolved')}
                      disabled={feedback.status === 'resolved'}
                    >
                      Mark as Resolved
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
