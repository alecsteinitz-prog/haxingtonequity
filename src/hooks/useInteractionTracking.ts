import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useInteractionTracking = () => {
  const { user } = useAuth();

  const trackInteraction = useCallback(async (
    postId: string, 
    interactionType: 'view' | 'like' | 'save' | 'share' | 'dwell_time',
    value: number = 1
  ) => {
    if (!user) return;

    try {
      await supabase
        .from('user_interactions')
        .upsert({
          user_id: user.id,
          post_id: postId,
          interaction_type: interactionType,
          interaction_value: value
        }, {
          onConflict: 'user_id,post_id,interaction_type'
        });
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  }, [user]);

  const trackView = useCallback((postId: string) => {
    trackInteraction(postId, 'view');
  }, [trackInteraction]);

  const trackLike = useCallback((postId: string) => {
    trackInteraction(postId, 'like');
  }, [trackInteraction]);

  const trackSave = useCallback((postId: string) => {
    trackInteraction(postId, 'save');
  }, [trackInteraction]);

  const trackDwellTime = useCallback((postId: string, seconds: number) => {
    if (seconds > 3) { // Only track meaningful dwell times
      trackInteraction(postId, 'dwell_time', seconds);
    }
  }, [trackInteraction]);

  return {
    trackView,
    trackLike,
    trackSave,
    trackDwellTime,
    trackInteraction
  };
};