import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Globe, AlertCircle, Check, Plus, X, Youtube, Instagram, Linkedin, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UrlExtractorProps {
  onExtractedData: (data: ExtractedCreatorData) => void;
}

interface ExtractedCreatorData {
  name?: string;
  role?: string;
  bio?: string;
  profileImageUrl?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    linkedin?: string;
    website?: string;
    [key: string]: string | undefined;
  };
  platformStats?: {
    followers?: number;
    subscribers?: number;
    likes?: number;
    [key: string]: number | undefined;
  };
  metaData?: {
    [key: string]: string | undefined;
  };
}

interface UrlEntry {
  id: string;
  url: string;
  platform: string;
  isExtracting: boolean;
  error?: string;
}

export function UrlExtractor({ onExtractedData }: UrlExtractorProps) {
  const [urls, setUrls] = useState<UrlEntry[]>([
    { id: '1', url: "", platform: "", isExtracting: false }
  ]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const detectPlatform = (url: string): string => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('tiktok.com')) return 'TikTok';
    if (url.includes('linkedin.com')) return 'LinkedIn';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter/X';
    if (url.includes('.com') || url.includes('.net') || url.includes('.org')) return 'Website';
    return 'Unknown';
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'YouTube': return <Youtube className="h-4 w-4 text-red-500" />;
      case 'Instagram': return <Instagram className="h-4 w-4 text-pink-500" />;
      case 'LinkedIn': return <Linkedin className="h-4 w-4 text-blue-500" />;
      case 'Twitter/X': return <Twitter className="h-4 w-4 text-blue-400" />;
      default: return <Globe className="h-4 w-4 text-gray-500" />;
    }
  };

  const addUrlField = () => {
    const newId = (urls.length + 1).toString();
    setUrls([...urls, { id: newId, url: "", platform: "", isExtracting: false }]);
  };

  const removeUrlField = (id: string) => {
    if (urls.length > 1) {
      setUrls(urls.filter(entry => entry.id !== id));
    }
  };

  const updateUrl = (id: string, url: string) => {
    setUrls(urls.map(entry => 
      entry.id === id 
        ? { ...entry, url, platform: detectPlatform(url), error: undefined }
        : entry
    ));
  };

  const extractFromUrl = async (urlEntry: UrlEntry): Promise<ExtractedCreatorData> => {
    // Call the API to extract creator data
    const response = await fetch("/api/creator-extraction/extract", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: urlEntry.url.trim() }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to extract creator data");
    }

    const { data } = await response.json();
    return data;
  };

  const handleExtractAll = async () => {
    const validUrls = urls.filter(entry => entry.url.trim());
    if (validUrls.length === 0) {
      toast({
        title: "No URLs provided",
        description: "Please enter at least one valid URL to extract data from",
        variant: "destructive",
      });
      return;
    }

    setIsExtracting(true);
    setSuccess(false);
    
    // Update extracting state for all valid URLs
    setUrls(urls.map(entry => 
      entry.url.trim() ? { ...entry, isExtracting: true, error: undefined } : entry
    ));

    try {
      const extractedDataList = await Promise.all(
        validUrls.map(async (urlEntry) => {
          try {
            return await extractFromUrl(urlEntry);
          } catch (error) {
            setUrls(current => current.map(entry => 
              entry.id === urlEntry.id 
                ? { ...entry, isExtracting: false, error: "Failed to extract from this URL" }
                : entry
            ));
            return null;
          }
        })
      );

      // Combine data from all successfully extracted URLs
      const combinedData = extractedDataList.reduce((combined, data) => {
        if (!data) return combined;
        
        return {
          name: data.name || combined.name,
          role: data.role || combined.role,
          bio: data.bio || combined.bio,
          profileImageUrl: data.profileImageUrl || combined.profileImageUrl,
          socialLinks: { ...combined.socialLinks, ...data.socialLinks },
          platformStats: { ...combined.platformStats, ...data.platformStats },
          metaData: { ...combined.metaData, ...data.metaData }
        };
      }, {
        name: "",
        role: "",
        bio: "",
        profileImageUrl: "",
        socialLinks: {},
        platformStats: {},
        metaData: {}
      });

      setSuccess(true);
      onExtractedData(combinedData);
      
      toast({
        title: "Creator data extracted",
        description: `Successfully extracted information from ${extractedDataList.filter(d => d).length} URL${extractedDataList.filter(d => d).length !== 1 ? 's' : ''}`,
      });
    } catch (error) {
      console.error("Extraction failed:", error);
      toast({
        title: "Extraction failed",
        description: "Failed to extract creator data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
      setUrls(urls.map(entry => ({ ...entry, isExtracting: false })));
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Extract Creator Data from Multiple URLs
        </CardTitle>
        <CardDescription>
          Add multiple creator profile URLs to extract comprehensive information from various platforms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {urls.map((urlEntry, index) => (
          <div key={urlEntry.id} className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="url"
                  placeholder={`Creator profile URL ${index + 1} (YouTube, Instagram, LinkedIn, etc.)`}
                  value={urlEntry.url}
                  onChange={(e) => updateUrl(urlEntry.id, e.target.value)}
                  disabled={urlEntry.isExtracting}
                />
              </div>
              {urls.length > 1 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeUrlField(urlEntry.id)}
                  disabled={isExtracting}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {urlEntry.platform && (
              <div className="flex items-center gap-2">
                {getPlatformIcon(urlEntry.platform)}
                <Badge variant="secondary" className="text-xs">
                  {urlEntry.platform}
                </Badge>
                {urlEntry.isExtracting && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Extracting...
                  </div>
                )}
              </div>
            )}
            
            {urlEntry.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{urlEntry.error}</AlertDescription>
              </Alert>
            )}
          </div>
        ))}

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={addUrlField}
            disabled={isExtracting}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Another URL
          </Button>
          
          <Button 
            onClick={handleExtractAll}
            disabled={isExtracting || !urls.some(entry => entry.url.trim())}
            className="flex items-center gap-2"
          >
            {isExtracting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Extracting from {urls.filter(e => e.url.trim()).length} URL{urls.filter(e => e.url.trim()).length !== 1 ? 's' : ''}...
              </>
            ) : (
              <>
                <Globe className="h-4 w-4" />
                Extract Data
              </>
            )}
          </Button>
        </div>

        {success && (
          <Alert className="bg-green-50 text-green-700 border-green-200">
            <Check className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Creator data successfully extracted from multiple sources!</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg w-full">
          <p className="font-medium mb-2">Supported platforms:</p>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="flex items-center gap-1">
              <Youtube className="h-3 w-3 text-red-500" />
              YouTube channels
            </div>
            <div className="flex items-center gap-1">
              <Instagram className="h-3 w-3 text-pink-500" />
              Instagram profiles
            </div>
            <div className="flex items-center gap-1">
              <Twitter className="h-3 w-3 text-blue-400" />
              Twitter/X profiles
            </div>
            <div className="flex items-center gap-1">
              <Linkedin className="h-3 w-3 text-blue-500" />
              LinkedIn profiles
            </div>
            <div className="flex items-center gap-1">
              <Globe className="h-3 w-3 text-gray-500" />
              Personal websites
            </div>
            <div className="flex items-center gap-1">
              <Globe className="h-3 w-3 text-gray-500" />
              Portfolio sites
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}