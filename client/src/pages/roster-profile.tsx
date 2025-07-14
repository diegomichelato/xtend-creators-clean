import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Instagram, Youtube, Music, Facebook, Globe, MessageCircle } from "lucide-react";
import { Link } from "wouter";

interface Creator {
  id: number;
  name: string;
  role: string;
  bio: string;
  profileImageUrl?: string;
  platforms?: string[];
  niche?: string[];
  performance?: {
    instagram?: { followers?: string; engagement?: string; posts?: string };
    youtube?: { subscribers?: string; views?: string; videos?: string };
    tiktok?: { followers?: string; likes?: string; videos?: string };
    facebook?: { followers?: string };
  };
}

function getPlatformIcon(platform: string, size = "h-5 w-5") {
  switch (platform.toLowerCase()) {
    case 'instagram': return <Instagram className={size} />;
    case 'youtube': return <Youtube className={size} />;
    case 'tiktok': return <Music className={size} />;
    case 'facebook': return <Facebook className={size} />;
    default: return <Globe className={size} />;
  }
}

function getNicheFromRole(role: string): string[] {
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

export default function RosterProfile() {
  const [match, params] = useRoute("/roster/:id");
  const creatorId = params?.id;

  const { data: creator, isLoading } = useQuery<Creator>({
    queryKey: [`/api/creators/${creatorId}`],
    enabled: !!creatorId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading creator profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Creator Not Found</h1>
          <p className="text-gray-600 mb-8">The creator you're looking for doesn't exist.</p>
          <Link href="/roster">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Roster
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const niches = getNicheFromRole(creator.role);
  const performance = creator.performance || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-accent">
        <div className="container mx-auto px-6 py-8">
          <Link href="/roster">
            <Button variant="outline" className="mb-4 bg-white/10 border-white/20 text-white hover:bg-white/20">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Roster
            </Button>
          </Link>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Profile Image */}
            <div className="w-32 h-32 rounded-full bg-white p-1 shadow-lg">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
                {creator.profileImageUrl ? (
                  <img 
                    src={creator.profileImageUrl} 
                    alt={creator.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-white text-3xl font-bold">
                    {creator.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                )}
              </div>
            </div>

            {/* Creator Info */}
            <div className="text-center md:text-left text-white">
              <h1 className="text-4xl font-bold mb-2">{creator.name}</h1>
              <p className="text-xl text-white/90 mb-4">{creator.role}</p>
              
              {/* Niche Tags */}
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                {niches.map((niche, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="bg-white/20 text-white border-white/30"
                  >
                    {niche}
                  </Badge>
                ))}
              </div>

              {/* Bio */}
              {creator.bio && (
                <p className="text-white/90 max-w-2xl">
                  {creator.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Section */}
      <div className="container mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Platform Performance</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Instagram */}
          {performance.instagram && (
            <Card className="bg-gradient-to-r from-pink-50/30 to-purple-50/30 border border-pink-100">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                    <Instagram className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-gray-900">Instagram</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {performance.instagram.followers || "0"}
                    </div>
                    <div className="text-sm text-gray-600">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {performance.instagram.engagement || "0%"}
                    </div>
                    <div className="text-sm text-gray-600">Engagement</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {performance.instagram.posts || "0"}
                    </div>
                    <div className="text-sm text-gray-600">Posts</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* YouTube */}
          {performance.youtube && (
            <Card className="bg-gradient-to-r from-red-50/30 to-orange-50/30 border border-red-100">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="bg-red-600 p-2 rounded-lg">
                    <Youtube className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-gray-900">YouTube</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {performance.youtube.subscribers || "0"}
                    </div>
                    <div className="text-sm text-gray-600">Subscribers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {performance.youtube.views || "0"}
                    </div>
                    <div className="text-sm text-gray-600">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {performance.youtube.videos || "0"}
                    </div>
                    <div className="text-sm text-gray-600">Videos</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TikTok */}
          {performance.tiktok && (
            <Card className="bg-gradient-to-r from-gray-50/30 to-gray-100/30 border border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="bg-black p-2 rounded-lg">
                    <TikTok className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-gray-900">TikTok</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {performance.tiktok.followers || "0"}
                    </div>
                    <div className="text-sm text-gray-600">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {performance.tiktok.likes || "0"}
                    </div>
                    <div className="text-sm text-gray-600">Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {performance.tiktok.videos || "0"}
                    </div>
                    <div className="text-sm text-gray-600">Videos</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Facebook */}
          {performance.facebook && (
            <Card className="bg-gradient-to-r from-blue-50/30 to-indigo-50/30 border border-blue-100">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Facebook className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-gray-900">Facebook</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {performance.facebook.followers || "0"}
                  </div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Interested in collaborating with {creator.name}?</h3>
            <p className="text-xl text-white/90 mb-6">
              Contact our partnerships team to discuss opportunities and campaign options.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-gray-100 font-semibold px-8 py-3"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Start Conversation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}