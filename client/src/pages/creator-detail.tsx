import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Upload, 
  ExternalLink,
  Mail,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  MessageSquare,
  FileText,
  Camera,
  Globe,
  Star,
  Target,
  Plus,
  Youtube,
  BarChart3,
  Instagram,
  Twitter,
  Eye,
  Heart,
  Share2,
  Activity,
  Clock,
  CheckCircle
} from "lucide-react";
import { useState } from "react";
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Creator } from "@shared/schema";

export default function CreatorDetail() {
  const params = useParams();
  const creatorId = params.id;
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState<"information" | "operations">("information");
  const [activeTab, setActiveTab] = useState("about");

  // Fetch creator data
  const { data: creator, isLoading, error } = useQuery({
    queryKey: [`/api/creators/${creatorId}`],
    enabled: !!creatorId,
  });

  // Fetch related operational data
  const { data: campaigns = [] } = useQuery({
    queryKey: [`/api/creators/${creatorId}/campaigns`],
    enabled: !!creatorId,
  });

  const { data: proposals = [] } = useQuery({
    queryKey: [`/api/creators/${creatorId}/proposals`],
    enabled: !!creatorId,
  });

  const { data: emailAccounts = [] } = useQuery({
    queryKey: [`/api/creators/${creatorId}/email-accounts`],
    enabled: !!creatorId,
  });

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    brandVoice: "",
    socialLinks: {},
    expertiseAndNiche: {},
    audienceData: {},
    platformStats: {},
    collaborationInfo: {},
  });

  // Update form data when creator data loads
  React.useEffect(() => {
    if (creator) {
      setFormData({
        name: creator.name || "",
        bio: creator.bio || "",
        brandVoice: creator.brandVoice || "",
        socialLinks: creator.socialLinks || {},
        expertiseAndNiche: creator.expertiseAndNiche || {},
        audienceData: creator.audienceData || {},
        platformStats: creator.platformStats || {},
        collaborationInfo: creator.collaborationInfo || {},
        performance: creator.performance || {
          instagram: { followers: "110.5K", engagementRate: "5.1%", avgLikes: "59.9K", posts: "97" },
          youtube: { subscribers: "2.8M", views: "28.0M", videos: "324" },
          tiktok: { followers: "554.0K", likes: "3.2M", videos: "189" },
          facebook: { followers: "160.8K" }
        },
      });
    }
  }, [creator]);

  const updateCreatorMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest(`/api/creators/${creatorId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/creators/${creatorId}`] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Creator profile updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update creator profile",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateCreatorMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">Failed to load creator profile</div>
        <Button asChild>
          <Link href="/creators">← Back to Creators</Link>
        </Button>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const socialLinks = formData.socialLinks as any || {};
  const expertise = formData.expertiseAndNiche as any || {};
  const audience = formData.audienceData as any || {};
  const stats = formData.platformStats as any || {};
  const collaboration = formData.collaborationInfo as any || {};

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/creators">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Creators
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 border-2 border-secondary/20">
              <AvatarImage src={creator.profileImageUrl || undefined} />
              <AvatarFallback className="bg-primary text-white text-lg font-semibold">
                {getInitials(creator.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-primary">{creator.name}</h1>
              <p className="text-secondary font-medium">{creator.role}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={isEditing ? "outline" : "default"}
            onClick={() => {
              if (isEditing) {
                setIsEditing(false);
              } else {
                setIsEditing(true);
              }
            }}
            className="flex items-center"
          >
            {isEditing ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
          
          {isEditing && (
            <Button onClick={handleSave} className="flex items-center">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          )}
          

        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section Navigation */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Profile Sections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={activeSection === "information" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveSection("information");
                  setActiveTab("about");
                }}
              >
                <Users className="h-4 w-4 mr-2" />
                Creator Information
              </Button>
              
              <Button
                variant={activeSection === "operations" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveSection("operations");
                  setActiveTab("campaigns");
                }}
              >
                <Activity className="h-4 w-4 mr-2" />
                Creator Operations
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Creator Information Section */}
            {activeSection === "information" && (
              <>
                <TabsList className="grid w-full grid-cols-6 bg-muted">
                  <TabsTrigger value="about" className="text-xs">About</TabsTrigger>
                  <TabsTrigger value="audience" className="text-xs">Audience</TabsTrigger>
                  <TabsTrigger value="performance" className="text-xs">Performance</TabsTrigger>
                  <TabsTrigger value="pricing" className="text-xs">Pricing</TabsTrigger>
                  <TabsTrigger value="collaboration" className="text-xs">Collaboration</TabsTrigger>
                  <TabsTrigger value="persona" className="text-xs">Persona</TabsTrigger>
                </TabsList>

                {/* About Tab */}
                <TabsContent value="about" className="space-y-6">
                  {/* Bio Section */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Biography</CardTitle>
                        <CardDescription>Creator's background and story</CardDescription>
                      </div>
                      <Button size="sm" variant="outline" className="flex items-center">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <Textarea
                          value={formData.bio}
                          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                          placeholder="Tell us about this creator's background, experience, and what makes them unique..."
                          rows={4}
                        />
                      ) : (
                        <p className="text-gray-700 leading-relaxed">
                          {creator.bio || "No biography provided yet."}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Brand Voice */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Brand Voice & Style</CardTitle>
                        <CardDescription>Communication style and brand personality</CardDescription>
                      </div>
                      <Button size="sm" variant="outline" className="flex items-center">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <Textarea
                          value={formData.brandVoice}
                          onChange={(e) => setFormData(prev => ({ ...prev, brandVoice: e.target.value }))}
                          placeholder="Describe their communication style, tone, aesthetic, and brand personality..."
                          rows={3}
                        />
                      ) : (
                        <p className="text-gray-700">
                          {creator.brandVoice || "Brand voice not defined yet."}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Expertise & Niche */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Expertise & Niche</CardTitle>
                      <CardDescription>Areas of expertise and content categories</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Primary Niche</label>
                            <Input
                              value={expertise.primaryNiche || ""}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                expertiseAndNiche: { ...expertise, primaryNiche: e.target.value }
                              }))}
                              placeholder="e.g., Tech Reviews, Fitness, Gaming"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Target Audience</label>
                            <Input
                              value={expertise.targetAudience || ""}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                expertiseAndNiche: { ...expertise, targetAudience: e.target.value }
                              }))}
                              placeholder="e.g., Tech enthusiasts, Young professionals"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium">Primary Niche</h4>
                            <p className="text-gray-600">{expertise.primaryNiche || "Not specified"}</p>
                          </div>
                          <div>
                            <h4 className="font-medium">Target Audience</h4>
                            <p className="text-gray-600">{expertise.targetAudience || "Not specified"}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Social Links */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Social Media Links</CardTitle>
                      <CardDescription>Creator's social media presence</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {isEditing ? (
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Youtube className="h-5 w-5 text-red-500" />
                              <Input
                                value={socialLinks.youtube || ""}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  socialLinks: { ...socialLinks, youtube: e.target.value }
                                }))}
                                placeholder="YouTube channel URL"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Instagram className="h-5 w-5 text-pink-500" />
                              <Input
                                value={socialLinks.instagram || ""}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  socialLinks: { ...socialLinks, instagram: e.target.value }
                                }))}
                                placeholder="Instagram profile URL"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {socialLinks.youtube && (
                              <div className="flex items-center space-x-2">
                                <Youtube className="h-5 w-5 text-red-500" />
                                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" 
                                   className="text-blue-600 hover:underline flex items-center">
                                  YouTube Channel <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </div>
                            )}
                            {socialLinks.instagram && (
                              <div className="flex items-center space-x-2">
                                <Instagram className="h-5 w-5 text-pink-500" />
                                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" 
                                   className="text-blue-600 hover:underline flex items-center">
                                  Instagram Profile <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </div>
                            )}
                            {!socialLinks.youtube && !socialLinks.instagram && (
                              <p className="text-gray-500">No social media links added yet.</p>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Audience Tab */}
                <TabsContent value="audience" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Audience Demographics</CardTitle>
                      <CardDescription>Who follows this creator</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {stats.totalFollowers || "0"}
                          </div>
                          <div className="text-sm text-gray-500">Total Followers</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-secondary">
                            {audience.avgAge || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">Average Age</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-accent">
                            {audience.primaryGender || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">Primary Gender</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance" className="space-y-4">
                  <div className="flex items-center gap-2 mb-6">
                    <BarChart3 className="h-5 w-5" />
                    <h2 className="text-lg font-semibold">Platform Performance</h2>
                  </div>

                  {/* Instagram Performance */}
                  <Card className="bg-gradient-to-r from-purple-50/30 to-pink-50/30 border border-purple-100">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                          <Instagram className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold">Instagram</h3>
                      </div>
                      <div className="grid grid-cols-4 gap-6">
                        <div className="text-center">
                          {isEditing ? (
                            <Input
                              value={performance.instagram?.followers || "110.5K"}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                performance: {
                                  ...prev.performance,
                                  instagram: { ...prev.performance?.instagram, followers: e.target.value }
                                }
                              }))}
                              className="text-center text-2xl font-bold border-none bg-transparent p-0 h-auto"
                            />
                          ) : (
                            <div className="text-2xl font-bold text-gray-900">110.5K</div>
                          )}
                          <div className="text-sm text-gray-600 mt-1">Followers</div>
                        </div>
                        <div className="text-center">
                          {isEditing ? (
                            <Input
                              value={performance.instagram?.engagementRate || "5.1%"}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                performance: {
                                  ...prev.performance,
                                  instagram: { ...prev.performance?.instagram, engagementRate: e.target.value }
                                }
                              }))}
                              className="text-center text-2xl font-bold border-none bg-transparent p-0 h-auto"
                            />
                          ) : (
                            <div className="text-2xl font-bold text-gray-900">5.1%</div>
                          )}
                          <div className="text-sm text-gray-600 mt-1">Engagement Rate</div>
                        </div>
                        <div className="text-center">
                          {isEditing ? (
                            <Input
                              value={performance.instagram?.avgLikes || "59.9K"}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                performance: {
                                  ...prev.performance,
                                  instagram: { ...prev.performance?.instagram, avgLikes: e.target.value }
                                }
                              }))}
                              className="text-center text-2xl font-bold border-none bg-transparent p-0 h-auto"
                            />
                          ) : (
                            <div className="text-2xl font-bold text-gray-900">59.9K</div>
                          )}
                          <div className="text-sm text-gray-600 mt-1">Avg. Likes</div>
                        </div>
                        <div className="text-center">
                          {isEditing ? (
                            <Input
                              value={performance.instagram?.posts || "97"}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                performance: {
                                  ...prev.performance,
                                  instagram: { ...prev.performance?.instagram, posts: e.target.value }
                                }
                              }))}
                              className="text-center text-2xl font-bold border-none bg-transparent p-0 h-auto"
                            />
                          ) : (
                            <div className="text-2xl font-bold text-gray-900">97</div>
                          )}
                          <div className="text-sm text-gray-600 mt-1">Posts</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* YouTube Performance */}
                  <Card className="bg-gradient-to-r from-red-50/30 to-orange-50/30 border border-red-100">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="bg-red-500 p-2 rounded-lg">
                          <Youtube className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold">YouTube</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-6">
                        <div className="text-center">
                          {isEditing ? (
                            <Input
                              value={performance.youtube?.subscribers || "2.8M"}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                performance: {
                                  ...prev.performance,
                                  youtube: { ...prev.performance?.youtube, subscribers: e.target.value }
                                }
                              }))}
                              className="text-center text-2xl font-bold border-none bg-transparent p-0 h-auto"
                            />
                          ) : (
                            <div className="text-2xl font-bold text-gray-900">2.8M</div>
                          )}
                          <div className="text-sm text-gray-600 mt-1">Subscribers</div>
                        </div>
                        <div className="text-center">
                          {isEditing ? (
                            <Input
                              value={performance.youtube?.views || "28.0M"}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                performance: {
                                  ...prev.performance,
                                  youtube: { ...prev.performance?.youtube, views: e.target.value }
                                }
                              }))}
                              className="text-center text-2xl font-bold border-none bg-transparent p-0 h-auto"
                            />
                          ) : (
                            <div className="text-2xl font-bold text-gray-900">28.0M</div>
                          )}
                          <div className="text-sm text-gray-600 mt-1">Views</div>
                        </div>
                        <div className="text-center">
                          {isEditing ? (
                            <Input
                              value={performance.youtube?.videos || "324"}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                performance: {
                                  ...prev.performance,
                                  youtube: { ...prev.performance?.youtube, videos: e.target.value }
                                }
                              }))}
                              className="text-center text-2xl font-bold border-none bg-transparent p-0 h-auto"
                            />
                          ) : (
                            <div className="text-2xl font-bold text-gray-900">324</div>
                          )}
                          <div className="text-sm text-gray-600 mt-1">Videos</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* TikTok Performance */}
                  <Card className="bg-gradient-to-r from-gray-50/30 to-gray-100/30 border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="bg-black p-2 rounded-lg">
                          <div className="h-5 w-5 bg-white rounded-sm flex items-center justify-center">
                            <span className="text-black text-xs font-bold">♪</span>
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">TikTok</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-6">
                        <div className="text-center">
                          {isEditing ? (
                            <Input
                              value={performance.tiktok?.followers || "554.0K"}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                performance: {
                                  ...prev.performance,
                                  tiktok: { ...prev.performance?.tiktok, followers: e.target.value }
                                }
                              }))}
                              className="text-center text-2xl font-bold border-none bg-transparent p-0 h-auto text-gray-900"
                            />
                          ) : (
                            <div className="text-2xl font-bold text-gray-900">554.0K</div>
                          )}
                          <div className="text-sm text-gray-600 mt-1">Followers</div>
                        </div>
                        <div className="text-center">
                          {isEditing ? (
                            <Input
                              value={performance.tiktok?.likes || "3.2M"}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                performance: {
                                  ...prev.performance,
                                  tiktok: { ...prev.performance?.tiktok, likes: e.target.value }
                                }
                              }))}
                              className="text-center text-2xl font-bold border-none bg-transparent p-0 h-auto text-gray-900"
                            />
                          ) : (
                            <div className="text-2xl font-bold text-gray-900">3.2M</div>
                          )}
                          <div className="text-sm text-gray-600 mt-1">Likes</div>
                        </div>
                        <div className="text-center">
                          {isEditing ? (
                            <Input
                              value={performance.tiktok?.videos || "189"}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                performance: {
                                  ...prev.performance,
                                  tiktok: { ...prev.performance?.tiktok, videos: e.target.value }
                                }
                              }))}
                              className="text-center text-2xl font-bold border-none bg-transparent p-0 h-auto text-gray-900"
                            />
                          ) : (
                            <div className="text-2xl font-bold text-gray-900">189</div>
                          )}
                          <div className="text-sm text-gray-600 mt-1">Videos</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Facebook Performance */}
                  <Card className="bg-gradient-to-r from-blue-50/30 to-indigo-50/30 border border-blue-100">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-500 p-2 rounded-lg">
                          <div className="h-5 w-5 bg-white rounded flex items-center justify-center">
                            <span className="text-blue-500 text-sm font-bold">f</span>
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold">Facebook</h3>
                      </div>
                      <div className="flex justify-center">
                        <div className="text-center">
                          {isEditing ? (
                            <Input
                              value={performance.facebook?.followers || "160.8K"}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                performance: {
                                  ...prev.performance,
                                  facebook: { ...prev.performance?.facebook, followers: e.target.value }
                                }
                              }))}
                              className="text-center text-2xl font-bold border-none bg-transparent p-0 h-auto"
                            />
                          ) : (
                            <div className="text-2xl font-bold text-gray-900">160.8K</div>
                          )}
                          <div className="text-sm text-gray-600 mt-1">Followers</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Pricing Tab */}
                <TabsContent value="pricing" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Creator Pricing</CardTitle>
                      <CardDescription>Rate cards and pricing structure</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <Card className="p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Youtube className="h-5 w-5 text-red-500" />
                              <span className="font-medium">YouTube</span>
                            </div>
                            <div className="text-2xl font-bold text-primary">$2,500</div>
                            <div className="text-sm text-gray-500">Per Video</div>
                          </Card>
                          <Card className="p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Instagram className="h-5 w-5 text-pink-500" />
                              <span className="font-medium">Instagram</span>
                            </div>
                            <div className="text-2xl font-bold text-primary">$1,200</div>
                            <div className="text-sm text-gray-500">Per Post</div>
                          </Card>
                          <Card className="p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Camera className="h-5 w-5 text-gray-500" />
                              <span className="font-medium">TikTok</span>
                            </div>
                            <div className="text-2xl font-bold text-primary">$800</div>
                            <div className="text-sm text-gray-500">Per Video</div>
                          </Card>
                        </div>
                        <Button className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Generate Proposal from Pricing
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Collaboration Tab */}
                <TabsContent value="collaboration" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Past Collaborations</CardTitle>
                      <CardDescription>Previous brand partnerships and campaigns</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {collaboration.pastBrands ? (
                          collaboration.pastBrands.map((brand: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded">
                              <div>
                                <div className="font-medium">{brand.name}</div>
                                <div className="text-sm text-gray-500">{brand.campaign}</div>
                              </div>
                              <Badge variant="outline">{brand.year}</Badge>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">No past collaborations recorded yet.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Persona Tab */}
                <TabsContent value="persona" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Creator Persona</CardTitle>
                      <CardDescription>Brand fit and campaign preferences</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Ideal Brand Fit</h4>
                          <p className="text-gray-600">Tech companies, startups, and innovative consumer products that align with Tyler's tech-savvy audience.</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Preferred Campaign Types</h4>
                          <div className="flex flex-wrap gap-2">
                            <Badge>Product Reviews</Badge>
                            <Badge>Tech Demos</Badge>
                            <Badge>Sponsored Content</Badge>
                            <Badge>Long-form Videos</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </>
            )}

            {/* Creator Operations Section */}
            {activeSection === "operations" && (
              <>
                <TabsList className="grid w-full grid-cols-7 bg-muted">
                  <TabsTrigger value="campaigns" className="text-xs">Campaigns</TabsTrigger>
                  <TabsTrigger value="proposals" className="text-xs">Proposals</TabsTrigger>
                  <TabsTrigger value="outbound" className="text-xs">Outbound</TabsTrigger>
                  <TabsTrigger value="inbound" className="text-xs">Inbound</TabsTrigger>
                  <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
                  <TabsTrigger value="emails" className="text-xs">Emails</TabsTrigger>
                  <TabsTrigger value="timeline" className="text-xs">Timeline</TabsTrigger>
                </TabsList>

                {/* Campaigns Tab */}
                <TabsContent value="campaigns" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Active & Past Campaigns</CardTitle>
                      <CardDescription>All campaigns involving this creator</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {campaigns.length > 0 ? (
                          campaigns.map((campaign: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded">
                              <div>
                                <div className="font-medium">{campaign.name}</div>
                                <div className="text-sm text-gray-500">{campaign.objective}</div>
                              </div>
                              <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                                {campaign.status}
                              </Badge>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">No campaigns found for this creator.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Proposals Tab */}
                <TabsContent value="proposals" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Proposals</CardTitle>
                      <CardDescription>Proposals sent for or involving this creator</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {proposals.length > 0 ? (
                          proposals.map((proposal: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded">
                              <div>
                                <div className="font-medium">{proposal.title}</div>
                                <div className="text-sm text-gray-500">
                                  {new Date(proposal.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                              <Badge>{proposal.status}</Badge>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">No proposals found for this creator.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Timeline Tab */}
                <TabsContent value="timeline" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Activity Timeline</CardTitle>
                      <CardDescription>Chronological history of interactions and activities</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                          <div>
                            <div className="font-medium">Profile Created</div>
                            <div className="text-sm text-gray-500">
                              {new Date(creator.lastUpdated).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-secondary rounded-full mt-2"></div>
                          <div>
                            <div className="font-medium">ViewStats Integration Added</div>
                            <div className="text-sm text-gray-500">Analytics tracking enabled</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Other operation tabs with placeholder content */}
                <TabsContent value="outbound" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Outbound Activity</CardTitle>
                      <CardDescription>Outbound campaigns targeting this creator</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-500">No outbound activity recorded yet.</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="inbound" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Inbound Activity</CardTitle>
                      <CardDescription>Requests and inquiries from brands</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-500">No inbound activity recorded yet.</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="content" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Content Inventory</CardTitle>
                      <CardDescription>Creator's content and media assets</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Content
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="emails" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Email Accounts</CardTitle>
                      <CardDescription>Team email accounts that have contacted this creator</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {emailAccounts.length > 0 ? (
                          emailAccounts.map((account: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded">
                              <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span>{account.email}</span>
                              </div>
                              <Badge variant="outline">{account.status}</Badge>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">No email communications recorded yet.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}