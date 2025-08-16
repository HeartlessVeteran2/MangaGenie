import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface OCRSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function OCRSettingsModal({ open, onOpenChange }: OCRSettingsModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
  });

  const [ocrSensitivity, setOcrSensitivity] = useState<number[]>([7]);
  const [translationQuality, setTranslationQuality] = useState('balanced');
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [showBoundaries, setShowBoundaries] = useState(false);

  // Initialize form values when settings load
  useState(() => {
    if (settings) {
      setOcrSensitivity([settings.ocrSensitivity || 7]);
      setTranslationQuality(settings.translationQuality || 'balanced');
      setAutoTranslate(settings.autoTranslate ?? true);
      setShowBoundaries(settings.showOcrBoundaries ?? false);
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (updates: any) => apiRequest('PUT', '/api/settings', updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Settings Updated",
        description: "OCR and translation settings have been saved",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to save settings",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateSettingsMutation.mutate({
      ocrSensitivity: ocrSensitivity[0],
      translationQuality,
      autoTranslate,
      showOcrBoundaries: showBoundaries,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface border-slate-700 text-slate-50 max-w-lg">
        <DialogHeader>
          <DialogTitle>OCR & Translation Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* OCR Sensitivity */}
          <div>
            <Label className="text-sm font-medium text-slate-300 mb-2 block">
              OCR Sensitivity: {ocrSensitivity[0]}
            </Label>
            <Slider
              value={ocrSensitivity}
              onValueChange={setOcrSensitivity}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
          
          {/* Translation Quality */}
          <div>
            <Label className="text-sm font-medium text-slate-300 mb-2 block">
              Translation Quality
            </Label>
            <Select value={translationQuality} onValueChange={setTranslationQuality}>
              <SelectTrigger className="w-full bg-slate-700 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fast">Fast (GPT-3.5) - Quick translations</SelectItem>
                <SelectItem value="balanced">Balanced (GPT-4o) - Best quality/speed ratio</SelectItem>
                <SelectItem value="premium">Premium (GPT-4o) - Highest quality</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Auto-translate toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Auto-translate detected text</Label>
              <p className="text-xs text-slate-500 mt-1">
                Automatically translate text after OCR detection
              </p>
            </div>
            <Switch
              checked={autoTranslate}
              onCheckedChange={setAutoTranslate}
            />
          </div>
          
          {/* Show boundaries toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Show OCR boundaries</Label>
              <p className="text-xs text-slate-500 mt-1">
                Display detection boxes around recognized text
              </p>
            </div>
            <Switch
              checked={showBoundaries}
              onCheckedChange={setShowBoundaries}
            />
          </div>
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
            onClick={handleSave}
            className="flex-1 bg-primary hover:bg-primary/90"
            disabled={updateSettingsMutation.isPending}
          >
            {updateSettingsMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
