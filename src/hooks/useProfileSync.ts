import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useProfileSync = () => {
  const { user } = useAuth();

  const syncEligibilityScore = async (score: number, analysisResult: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          funding_eligibility_score: score,
          last_eligibility_update: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error syncing eligibility score:', error);
      }
    } catch (error) {
      console.error('Error syncing eligibility score:', error);
    }
  };

  return { syncEligibilityScore };
};