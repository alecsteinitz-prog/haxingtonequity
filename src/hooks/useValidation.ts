import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ValidationOptions {
  analysisId: string;
  analysisType: 'deal_analysis' | 'lender_match' | 'recommendation';
  data: any;
  enabled?: boolean;
}

export const useValidation = ({ analysisId, analysisType, data, enabled = true }: ValidationOptions) => {
  useEffect(() => {
    if (!enabled || !analysisId || !data) return;

    const validateData = async () => {
      try {
        // Call the validation function
        const { data: validationResult, error } = await supabase
          .rpc('validate_analysis_data', {
            p_analysis_id: analysisId,
            p_analysis_type: analysisType,
            p_data: data
          });

        if (error) {
          console.error('Validation error:', error);
        } else {
          console.log('Validation completed:', validationResult);
        }
      } catch (error) {
        console.error('Failed to validate data:', error);
      }
    };

    // Run validation after a short delay to ensure data is saved
    const timeoutId = setTimeout(validateData, 1000);

    return () => clearTimeout(timeoutId);
  }, [analysisId, analysisType, data, enabled]);
};
