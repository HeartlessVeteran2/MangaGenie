import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useOCR() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const ocrMutation = useMutation({
    mutationFn: async ({ pageId, language }: { pageId: string; language: string }) => {
      const response = await apiRequest('POST', `/api/pages/${pageId}/ocr`, {
        language: language === 'jpn' ? 'jpn+eng' : language === 'kor' ? 'kor+eng' : 'chi_sim+eng'
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "OCR Complete",
        description: `Detected ${data.ocrResults?.length || 0} text regions`,
      });
      
      // Invalidate the page query to refresh data
      queryClient.invalidateQueries({ 
        queryKey: ['/api/chapters'],
      });
    },
    onError: (error) => {
      console.error('OCR error:', error);
      toast({
        title: "OCR Failed",
        description: "Failed to detect text in the image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const processOCR = async (pageId: string, language: string = 'jpn') => {
    return ocrMutation.mutateAsync({ pageId, language });
  };

  return {
    processOCR,
    isProcessing: ocrMutation.isPending,
    error: ocrMutation.error,
  };
}
