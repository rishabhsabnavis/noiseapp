import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type FileUploadProps = {
  onUpload: (file: File, location: string) => Promise<void>;
};

type UploadedFileInfo = {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  location: string;
  uploadTime: string;
  classification?: ClassificationResult[];
  topPrediction?: {
    label: string;
    confidence: number;
  };
};

type ClassificationResult = {
  label: string;
  score: number;
};

// Your Inference Endpoint configuration
const HF_API_TOKEN = import.meta.env.VITE_HF_API_TOKEN;
const ENDPOINT_URL = "https://uqkktcn5dm2ucj8d.us-east-1.aws.endpoints.huggingface.cloud"; // Replace with your actual endpoint URL

export function FileUpload({ onUpload }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [location, setLocation] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileInfo[]>([]);
  const [classificationResult, setClassificationResult] = useState<ClassificationResult[] | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'audio/mpeg' || droppedFile.name.endsWith('.mp3')) {
        setFile(droppedFile);
        setError(null);
        setClassificationResult(null);
      } else {
        setError('Please upload an MP3 file');
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'audio/mpeg' || selectedFile.name.endsWith('.mp3')) {
        setFile(selectedFile);
        setError(null);
        setClassificationResult(null);
      } else {
        setError('Please upload an MP3 file');
      }
    }
  };

  // Classify audio using Inference Endpoints
  const classifyAudio = async (audioFile: File): Promise<ClassificationResult[]> => {
    setIsClassifying(true);
    setClassificationResult(null);
    
    try {
      // Check if API token exists
      if (!HF_API_TOKEN) {
        throw new Error('Hugging Face API token is not configured');
      }

      // Convert file to array buffer
      const arrayBuffer = await audioFile.arrayBuffer();
      
      const response = await fetch(ENDPOINT_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_TOKEN}`,
          'Content-Type': 'audio/mpeg',
        },
        body: arrayBuffer
      });

      if (!response.ok) {
        // Log more details about the error
        const errorText = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText
        });

        // Handle endpoint scaling from zero
        if (response.status === 503) {
          throw new Error('Model is loading, please wait a moment and try again');
        }
        throw new Error(`Endpoint error: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      setClassificationResult(result);
      return result;
      
    } catch (error) {
      console.error('Classification error:', error);
      throw new Error(`Classification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsClassifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // First classify the audio
      let classification: ClassificationResult[] = [];
      let topPrediction = { label: 'unknown', confidence: 0 };

      try {
        classification = await classifyAudio(file);
        
        // Find top prediction
        if (classification.length > 0) {
          const top = classification.reduce((max, current) => 
            current.score > max.score ? current : max
          );
          topPrediction = { label: top.label, confidence: top.score };
        }
      } catch (classError) {
        console.error('Classification failed:', classError);
        setError(`Audio classification failed: ${classError instanceof Error ? classError.message : 'Unknown error'}`);
        // Continue with upload even if classification fails
      }

      // Upload the file
      await onUpload(file, location);

      // Add to uploaded files with classification results
      const fileInfo: UploadedFileInfo = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        location: location,
        uploadTime: new Date().toLocaleString(),
        classification: classification,
        topPrediction: topPrediction
      };

      setUploadedFiles(prev => [fileInfo, ...prev]);

      // Reset form
      setFile(null);
      setLocation('');
      setClassificationResult(null);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  // Get noise level color for styling
  const getNoiseLevelColor = (label: string) => {
    const colors = {
      'low': 'bg-green-100 text-green-800 border-green-200',
      'moderate': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'high': 'bg-orange-100 text-orange-800 border-orange-200',
      'very_high': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[label as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Format file size to human readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Your Audio</CardTitle>
          <CardDescription>
            Upload your audio file here to get the noise pollution level for the location using our dedicated AI endpoint.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="space-y-2">
                  <div className="text-sm font-medium">{file.name}</div>
                  <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                </div>
              ) : (
                <>
                  <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <span className="text-sm text-gray-600">
                      Drag and drop your MP3 file here, or{' '}
                    </span>
                    <label htmlFor="file-upload" className="text-blue-600 hover:text-blue-500 cursor-pointer">
                      click to browse
                    </label>
                  </div>
                </>
              )}
              <Input
                id="file-upload"
                type="file"
                accept=".mp3,audio/mpeg"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {file && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setFile(null);
                  setClassificationResult(null);
                }}
              >
                Remove File
              </Button>
            )}

            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-2">
                Location
              </label>
              <Input
                id="location"
                type="text"
                placeholder="Enter location (e.g., Downtown Park, 5th Street)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isUploading}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
                {error}
              </div>
            )}

            {/* Real-time Classification Results */}
            {classificationResult && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">🎵 Audio Analysis Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {classificationResult.map((result, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <Badge 
                        variant="outline" 
                        className={`${getNoiseLevelColor(result.label)} capitalize`}
                      >
                        {result.label.replace('_', ' ')} Noise
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <Progress 
                          value={result.score * 100} 
                          className="w-20 h-2" 
                        />
                        <span className="text-sm font-medium">
                          {(result.score * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Button 
              type="submit" 
              disabled={!file || !location.trim() || isUploading || isClassifying}
              className="w-full"
            >
              {isUploading ? 'Uploading...' : 
               isClassifying ? 'Analyzing Audio...' : 
               'Upload & Analyze'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Uploaded Files Section with Classification Results */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedFiles.map((fileInfo, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{fileInfo.name}</h4>
                      <p className="text-sm text-gray-500">
                        Uploaded on {fileInfo.uploadTime}
                      </p>
                    </div>
                    {fileInfo.topPrediction && (
                      <Badge className={getNoiseLevelColor(fileInfo.topPrediction.label)}>
                        {fileInfo.topPrediction.label.replace('_', ' ')} 
                        ({(fileInfo.topPrediction.confidence * 100).toFixed(1)}%)
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Location:</span> {fileInfo.location}
                    </div>
                    <div>
                      <span className="font-medium">File Size:</span> {formatFileSize(fileInfo.size)}
                    </div>
                  </div>

                  {fileInfo.classification && fileInfo.classification.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Noise Analysis:</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {fileInfo.classification.map((result, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="capitalize">{result.label.replace('_', ' ')}</span>
                            <span>{(result.score * 100).toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17,8 12,3 7,8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}
