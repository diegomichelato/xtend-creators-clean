import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Link } from "wouter";
import { Star, Users, Eye, MessageCircle, Instagram, Youtube, Facebook, Music, Share2, Copy, Check } from "lucide-react";

interface Creator {
  id: number;
  name: string;
  role: string;
  bio: string;
  profileImageUrl?: string;
  platforms?: string[];
  niche?: string[];
  followers?: {
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    facebook?: string;
  };
  performance?: {
    instagram?: { followers?: string; engagement?: string; posts?: string };
    youtube?: { subscribers?: string; views?: string; videos?: string };
    tiktok?: { followers?: string; likes?: string; videos?: string };
    facebook?: { followers?: string };
  };
}

const FOLLOWER_TIERS = [
  { label: "All Tiers", value: "all" },
  { label: "Nano (1K-10K)", value: "nano" },
  { label: "Micro (10K-100K)", value: "micro" },
  { label: "Macro (100K-1M)", value: "macro" },
  { label: "Mega (1M+)", value: "mega" }
];

const PLATFORMS = [
  { label: "All Platforms", value: "all" },
  { label: "Instagram", value: "instagram" },
  { label: "YouTube", value: "youtube" },
  { label: "TikTok", value: "tiktok" },
  { label: "Facebook", value: "facebook" }
];

function getPlatformIcon(platform: string) {
  switch (platform.toLowerCase()) {
    case 'instagram': return <Instagram className="h-4 w-4" />;
    case 'youtube': return <Youtube className="h-4 w-4" />;
    case 'tiktok': return <Music className="h-4 w-4" />;
    case 'facebook': return <Facebook className="h-4 w-4" />;
    default: return <Star className="h-4 w-4" />;
  }
}

function getTopPlatform(creator: Creator) {
  const performance = creator.performance;
  if (!performance) return null;

  // Convert follower counts to numbers for comparison
  const platforms = [];
  if (performance.instagram?.followers) {
    platforms.push({ name: 'Instagram', count: parseFollowerCount(performance.instagram.followers) });
  }
  if (performance.youtube?.subscribers) {
    platforms.push({ name: 'YouTube', count: parseFollowerCount(performance.youtube.subscribers) });
  }
  if (performance.tiktok?.followers) {
    platforms.push({ name: 'TikTok', count: parseFollowerCount(performance.tiktok.followers) });
  }
  if (performance.facebook?.followers) {
    platforms.push({ name: 'Facebook', count: parseFollowerCount(performance.facebook.followers) });
  }

  if (platforms.length === 0) return null;
  
  // Return platform with highest follower count
  return platforms.reduce((max, platform) => platform.count > max.count ? platform : max);
}

function parseFollowerCount(countStr: string): number {
  if (!countStr) return 0;
  const cleanStr = countStr.replace(/[,\s]/g, '').toLowerCase();
  
  if (cleanStr.includes('k')) {
    return parseFloat(cleanStr.replace('k', '')) * 1000;
  }
  if (cleanStr.includes('m')) {
    return parseFloat(cleanStr.replace('m', '')) * 1000000;
  }
  return parseFloat(cleanStr) || 0;
}

function getFollowerTier(creator: Creator): string {
  const topPlatform = getTopPlatform(creator);
  if (!topPlatform) return 'nano';
  
  const count = topPlatform.count;
  if (count >= 1000000) return 'mega';
  if (count >= 100000) return 'macro';
  if (count >= 10000) return 'micro';
  return 'nano';
}

function getNicheFromRole(role: string | undefined | null): string[] {
  if (!role || typeof role !== 'string') {
    return ['Content Creator'];
  }
  
  // Extract niche from role/bio
  const lowercaseRole = role.toLowerCase();
  const niches = [];
  
  if (lowercaseRole.includes('tech') || lowercaseRole.includes('technology')) niches.push('Tech');
  if (lowercaseRole.includes('fitness') || lowercaseRole.includes('health')) niches.push('Fitness');
  if (lowercaseRole.includes('beauty') || lowercaseRole.includes('makeup')) niches.push('Beauty');
  if (lowercaseRole.includes('food') || lowercaseRole.includes('cooking')) niches.push('Food');
  if (lowercaseRole.includes('travel')) niches.push('Travel');
  if (lowercaseRole.includes('lifestyle')) niches.push('Lifestyle');
  if (lowercaseRole.includes('gaming') || lowercaseRole.includes('game')) niches.push('Gaming');
  if (lowercaseRole.includes('education') || lowercaseRole.includes('learning')) niches.push('Education');
  if (lowercaseRole.includes('entertainment')) niches.push('Entertainment');
  if (lowercaseRole.includes('youtube')) niches.push('YouTube Creator');
  
  return niches.length > 0 ? niches : ['Content Creator'];
}

export default function Roster() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedTier, setSelectedTier] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: creators, isLoading } = useQuery<Creator[]>({
    queryKey: ["/api/creators"],
  });

  const filteredCreators = creators?.filter(creator => {
    // Search filter
    if (searchTerm && creator.name && creator.role && 
        !creator.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !creator.role.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Niche filter
    if (selectedNiche && selectedNiche !== "all" && creator.role) {
      const creatorNiches = getNicheFromRole(creator.role);
      if (!creatorNiches.some(niche => niche.toLowerCase().includes(selectedNiche.toLowerCase()))) {
        return false;
      }
    }

    // Platform filter
    if (selectedPlatform) {
      const topPlatform = getTopPlatform(creator);
      if (!topPlatform || topPlatform.name.toLowerCase() !== selectedPlatform.toLowerCase()) {
        return false;
      }
    }

    // Tier filter
    if (selectedTier) {
      if (getFollowerTier(creator) !== selectedTier) {
        return false;
      }
    }

    return true;
  }) || [];

  const allNiches = Array.from(
    new Set(creators?.flatMap(creator => creator.role ? getNicheFromRole(creator.role) : []) || [])
  );

  const handleShareRoster = async () => {
    const shareUrl = `${window.location.origin}/roster-public`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading our amazing creators...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-accent">
        <div className="container mx-auto px-6 py-16 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            Meet Our Creators
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Discover top-tier creators in every category, ready for your next campaign
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search creators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Select value={selectedNiche} onValueChange={setSelectedNiche}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Niche" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Niches</SelectItem>
                  {allNiches.map(niche => (
                    <SelectItem key={niche} value={niche}>{niche}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Platform" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map(platform => (
                    <SelectItem key={platform.value} value={platform.value || "all"}>
                      {platform.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={selectedTier} onValueChange={setSelectedTier}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Tier" />
                </SelectTrigger>
                <SelectContent>
                  {FOLLOWER_TIERS.map(tier => (
                    <SelectItem key={tier.value} value={tier.value}>
                      {tier.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredCreators.length} creator{filteredCreators.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Creators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCreators.map((creator) => {
            if (!creator || !creator.name) return null;
            
            const topPlatform = getTopPlatform(creator);
            const niches = creator.role ? getNicheFromRole(creator.role) : ['Content Creator'];
            
            return (
              <Card key={creator.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                <CardContent className="p-6">
                  {/* Profile Image */}
                  <div className="relative mb-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mx-auto flex items-center justify-center overflow-hidden">
                      {creator.profileImageUrl ? (
                        <img 
                          src={creator.profileImageUrl} 
                          alt={creator.name || 'Creator'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-white text-2xl font-bold">
                          {creator.name ? creator.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'CR'}
                        </div>
                      )}
                    </div>
                    {topPlatform && (
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
                        {getPlatformIcon(topPlatform.name)}
                      </div>
                    )}
                  </div>

                  {/* Name & Handle */}
                  <div className="text-center mb-3">
                    <h3 className="font-semibold text-lg text-gray-900">{creator.name || 'Creator'}</h3>
                    <p className="text-sm text-gray-600">{creator.role || 'Content Creator'}</p>
                  </div>

                  {/* Niche Tags */}
                  <div className="flex flex-wrap justify-center gap-1 mb-4">
                    {niches.slice(0, 2).map((niche, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-xs bg-primary/10 text-primary border-primary/20"
                      >
                        {niche}
                      </Badge>
                    ))}
                  </div>

                  {/* Top Platform Stats */}
                  {topPlatform && (
                    <div className="text-center mb-4">
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-1">
                        {getPlatformIcon(topPlatform.name)}
                        <span className="font-medium">{topPlatform.name}</span>
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {topPlatform.count >= 1000000 
                          ? `${(topPlatform.count / 1000000).toFixed(1)}M`
                          : topPlatform.count >= 1000 
                          ? `${(topPlatform.count / 1000).toFixed(1)}K`
                          : topPlatform.count.toLocaleString()
                        }
                      </div>
                      <div className="text-xs text-gray-500">
                        {topPlatform.name === 'YouTube' ? 'Subscribers' : 'Followers'}
                      </div>
                    </div>
                  )}

                  {/* Bio Preview */}
                  {creator.bio && (
                    <p className="text-sm text-gray-600 text-center mb-4 line-clamp-2">
                      {creator.bio}
                    </p>
                  )}

                  {/* View Profile Button */}
                  <Link href={`/roster/${creator.id}`}>
                    <Button 
                      className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
                      size="sm"
                    >
                      View Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          }).filter(Boolean)}
        </div>

        {/* Empty State */}
        {filteredCreators.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No creators found</h3>
            <p className="text-gray-500">Try adjusting your filters to see more results.</p>
          </div>
        )}
      </div>

      {/* Call to Action Section */}
      <div className="bg-gradient-to-r from-primary to-accent mt-16">
        <div className="container mx-auto px-6 py-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Interested in a collaboration?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Contact our partnerships team to discuss opportunities with our creators.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-gray-100 font-semibold px-8 py-3"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Get In Touch
          </Button>
        </div>
      </div>
    </div>
  );
}