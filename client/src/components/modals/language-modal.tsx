import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LanguageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const languagePairs = [
  { 
    id: 'jp-en', 
    label: 'Japanese → English',
    flag: 'JP',
    color: 'bg-red-500'
  },
  { 
    id: 'kr-en', 
    label: 'Korean → English',
    flag: 'KR',
    color: 'bg-blue-500'
  },
  { 
    id: 'cn-en', 
    label: 'Chinese → English',
    flag: 'CN',
    color: 'bg-yellow-500'
  },
];

export default function LanguageModal({ open, onOpenChange }: LanguageModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPair, setSelectedPair] = useState<string>('');

  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (updates: any) => apiRequest('PUT', '/api/settings', updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Language Updated",
        description: "Default translation language has been updated",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update language settings",
        variant: "destructive",
      });
    },
  });

  const handleApply = () => {
    if (!selectedPair) return;
    
    updateSettingsMutation.mutate({
      defaultLanguagePair: selectedPair
    });
  };

  const currentPair = settings?.defaultLanguagePair || 'jp-en';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface border-slate-700 text-slate-50">
        <DialogHeader>
          <DialogTitle>Translation Languages</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          {languagePairs.map((pair) => {
            const isSelected = selectedPair === pair.id;
            const isCurrent = currentPair === pair.id;
            
            return (
              <Card
                key={pair.id}
                className={`p-3 cursor-pointer transition-all border ${
                  isSelected 
                    ? 'bg-primary/20 border-primary' 
                    : isCurrent && !selectedPair
                    ? 'bg-primary/10 border-primary/50'
                    : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                }`}
                onClick={() => setSelectedPair(pair.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${pair.color} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                      {pair.flag}
                    </div>
                    <span className="font-medium">{pair.label}</span>
                  </div>
                  {(isSelected || (isCurrent && !selectedPair)) && (
                    <i className="fas fa-check text-primary"></i>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex space-x-3 mt-6">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            disabled={updateSettingsMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 bg-primary hover:bg-primary/90"
            disabled={!selectedPair || updateSettingsMutation.isPending}
          >
            {updateSettingsMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Updating...
              </>
            ) : (
              'Apply'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
