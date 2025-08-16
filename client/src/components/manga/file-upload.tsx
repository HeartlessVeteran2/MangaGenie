import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface FileUploadProps {
  onComplete?: () => void;
}

export default function FileUpload({ onComplete }: FileUploadProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState("");
  const [originalLanguage, setOriginalLanguage] = useState("Japanese");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async ({ files, mangaData }: { files: File[], mangaData: any }) => {
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));
      formData.append('title', mangaData.title);
      formData.append('originalLanguage', mangaData.originalLanguage);
      formData.append('targetLanguage', 'English');

      return apiRequest('POST', '/api/manga/upload', formData);
    },
    onSuccess: (data: any) => {
      const response = data as any;
      toast({
        title: "Upload Successful",
        description: `${title} has been added to your library`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/manga'] });
      
      if (response.manga?.id) {
        setLocation(`/reader/${response.manga.id}/1`);
      }
      onComplete?.();
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload manga files. Please try again.",
        variant: "destructive",
      });
      setIsUploading(false);
      setUploadProgress(0);
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your manga",
        variant: "destructive",
      });
      return;
    }

    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 90) {
        clearInterval(interval);
        progress = 90;
      }
      setUploadProgress(progress);
    }, 200);

    uploadMutation.mutate({
      files: acceptedFiles,
      mangaData: { title, originalLanguage }
    });

    // Complete progress on mutation success/error
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
    }, 3000);

  }, [title, originalLanguage, uploadMutation, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
      'application/zip': ['.zip', '.cbz'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 50,
    maxSize: 10 * 1024 * 1024, // 10MB per file
  });

  return (
    <div className="space-y-6">
      {/* Manga Details Form */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Manga Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter manga title..."
            className="bg-slate-700 border-slate-600"
          />
        </div>
        
        <div>
          <Label htmlFor="language">Original Language</Label>
          <select
            id="language"
            value={originalLanguage}
            onChange={(e) => setOriginalLanguage(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
          >
            <option value="Japanese">Japanese</option>
            <option value="Korean">Korean</option>
            <option value="Chinese">Chinese</option>
          </select>
        </div>
      </div>

      {/* File Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragActive 
            ? 'border-primary bg-primary/5' 
            : isUploading
            ? 'border-green-500 bg-green-500/5'
            : 'border-slate-600 hover:border-primary/50 hover:bg-primary/5'
        }`}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div className="space-y-4">
            <i className="fas fa-spinner fa-spin text-4xl text-primary"></i>
            <div>
              <p className="text-primary font-medium">Processing manga files...</p>
              <p className="text-sm text-slate-400 mt-1">
                Uploading and preparing for AI translation
              </p>
            </div>
            <Progress value={uploadProgress} className="max-w-xs mx-auto" />
          </div>
        ) : uploadMutation.isSuccess ? (
          <div className="space-y-4">
            <i className="fas fa-check-circle text-4xl text-green-400"></i>
            <div>
              <p className="text-green-400 font-medium">Upload successful!</p>
              <p className="text-sm text-slate-400">Ready for AI translation</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <i className="fas fa-cloud-upload-alt text-4xl text-slate-400"></i>
            <div>
              <p className="text-slate-300 font-medium">
                {isDragActive ? 'Drop files here...' : 'Drop manga files here or click to browse'}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Supports: JPG, PNG, WebP, PDF, CBZ (Max 50 files, 10MB each)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Button */}
      <div className="flex justify-end space-x-3">
        <Button
          variant="ghost"
          onClick={onComplete}
          disabled={isUploading}
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            if (title.trim()) {
              // Trigger file dialog
              document.querySelector('input[type="file"]')?.click();
            } else {
              toast({
                title: "Title Required",
                description: "Please enter a title for your manga",
                variant: "destructive",
              });
            }
          }}
          disabled={isUploading || !title.trim()}
          className="bg-primary hover:bg-primary/90"
        >
          {isUploading ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Uploading...
            </>
          ) : (
            <>
              <i className="fas fa-upload mr-2"></i>
              Choose Files
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
