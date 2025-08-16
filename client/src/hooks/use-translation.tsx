import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useTranslation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const translationMutation = useMutation({
    mutationFn: async ({ 
      pageId, 
      sourceLanguage, 
      targetLanguage, 
      quality 
    }: { 
      pageId: string; 
      sourceLanguage: string; 
      targetLanguage: string;
      quality: string;
    }) => {
      const response = await apiRequest('POST', `/api/pages/${pageId}/translate`, {
        sourceLanguage,
        targetLanguage,
        quality
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Translation Complete",
        description: `Translated ${data.translations?.length || 0} text regions`,
      });
      
      // Invalidate the page query to refresh data
      queryClient.invalidateQueries({ 
        queryKey: ['/api/chapters'],
      });
    },
    onError: (error) => {
      console.error('Translation error:', error);
      toast({
        title: "Translation Failed",
        description: "Failed to translate text. Please check your API key and try again.",
        variant: "destructive",
      });
    },
  });

  const translatePage = async (
    pageId: string, 
    sourceLanguage: string, 
    targetLanguage: string = 'English',
    quality: string = 'balanced'
  ) => {
    return translationMutation.mutateAsync({ 
      pageId, 
      sourceLanguage, 
      targetLanguage, 
      quality 
    });
  };

  return {
    translatePage,
    isTranslating: translationMutation.isPending,
    error: translationMutation.error,
  };
}
