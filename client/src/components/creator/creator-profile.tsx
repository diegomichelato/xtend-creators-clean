import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
  Plus
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Creator } from "@shared/schema";

// We'll create inline tab components since the tab directory doesn't exist

interface CreatorProfileProps {
  creatorId: string;
}

export function CreatorProfile({ creatorId }: CreatorProfileProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState<"information" | "operations">("information");
  const [activeTab, setActiveTab] = useState("about");

  // Fetch creator data
  const { data: creator, isLoading, error } = useQuery({
    queryKey: [`/api/creators/${creatorId}`],
    enabled: !!creatorId,
  });

  // Fetch related data for operations tabs
  const { data: campaigns = [] } = useQuery({
    queryKey: [`/api/creators/${creatorId}/campaigns`],
    enabled: !!creatorId,
  });

  // Fetch all proposals and filter on the frontend to ensure they show up
  const { data: allProposals = [] } = useQuery({
    queryKey: ['/api/proposals'],
    enabled: !!creatorId,
  });

  // Filter proposals for this creator - using database data
  const proposals = React.useMemo(() => {
    if (!Array.isArray(allProposals)) return [];
    
    const creatorIdInt = parseInt(creatorId);
    return allProposals.filter(proposal => {
      if (!proposal.creators) return false;
      
      // Handle array format
      if (Array.isArray(proposal.creators)) {
        return proposal.creators.includes(creatorIdInt);
      }
      
      // Handle PostgreSQL array string format {11,13}
      if (typeof proposal.creators === 'string' && proposal.creators.startsWith('{')) {
        const arrString = proposal.creators.substring(1, proposal.creators.length - 1);
        const creatorIds = arrString.split(',').map(id => parseInt(id.trim(), 10));
        return creatorIds.includes(creatorIdInt);
      }
      
      return false;
    });
  }, [allProposals, creatorId]);

  const { data: emailAccounts = [] } = useQuery({
    queryKey: [`/api/creators/${creatorId}/email-accounts`],
    enabled: !!creatorId,
  });

  const { data: contentInventory = [] } = useQuery({
    queryKey: [`/api/creators/${creatorId}/content`],
    enabled: !!creatorId,
  });

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
        

      </div>

      {/* Main Content Sections */}
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
                  setActiveTab("outbound");
                }}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
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
                  <TabsTrigger value="audience" className="text-xs">Audience & Reach</TabsTrigger>
                  <TabsTrigger value="performance" className="text-xs">Performance</TabsTrigger>
                  <TabsTrigger value="pricing" className="text-xs">Pricing</TabsTrigger>
                  <TabsTrigger value="collaboration" className="text-xs">Collaboration</TabsTrigger>
                  <TabsTrigger value="persona" className="text-xs">Persona</TabsTrigger>
                </TabsList>

                <TabsContent value="about">
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
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Biography</h4>
                          <p className="text-gray-700">No biography provided yet.</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Brand Voice & Style</h4>
                          <p className="text-gray-700">Brand voice not defined yet.</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Expertise & Niche</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium">Primary Niche</p>
                              <p className="text-gray-600">Not specified</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Target Audience</p>
                              <p className="text-gray-600">Not specified</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Social Media Links</h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-red-500">📺</span>
                              <a href="#" className="text-blue-600 hover:underline">YouTube Channel</a>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-pink-500">📷</span>
                              <a href="#" className="text-blue-600 hover:underline">Instagram Profile</a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="audience">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Audience & Reach</CardTitle>
                        <CardDescription>Follower demographics and engagement metrics</CardDescription>
                      </div>
                      <Button size="sm" variant="outline" className="flex items-center">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-500">Audience metrics coming soon</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="performance">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Performance</CardTitle>
                        <CardDescription>Content performance and analytics</CardDescription>
                      </div>
                      <Button size="sm" variant="outline" className="flex items-center">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-500">Performance metrics coming soon</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="pricing">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Pricing</CardTitle>
                        <CardDescription>Content creation rates and packages</CardDescription>
                      </div>
                      <Button size="sm" variant="outline" className="flex items-center">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-500">Pricing information coming soon</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="collaboration">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Collaboration</CardTitle>
                        <CardDescription>Partnership preferences and requirements</CardDescription>
                      </div>
                      <Button size="sm" variant="outline" className="flex items-center">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-500">Collaboration details coming soon</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="persona">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Persona</CardTitle>
                        <CardDescription>Creator personality and brand identity</CardDescription>
                      </div>
                      <Button size="sm" variant="outline" className="flex items-center">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-500">Creator persona coming soon</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </>
            )}

            {/* Creator Operations Section */}
            {activeSection === "operations" && (
              <>
                <TabsList className="grid w-full grid-cols-7 bg-muted">
                  <TabsTrigger value="outbound" className="text-xs">Outbound</TabsTrigger>
                  <TabsTrigger value="inbound" className="text-xs">Inbound</TabsTrigger>
                  <TabsTrigger value="campaigns" className="text-xs">Campaigns</TabsTrigger>
                  <TabsTrigger value="proposals" className="text-xs">Proposals</TabsTrigger>
                  <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
                  <TabsTrigger value="emails" className="text-xs">Emails</TabsTrigger>
                  <TabsTrigger value="timeline" className="text-xs">Timeline</TabsTrigger>
                </TabsList>

                <TabsContent value="outbound">
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-gray-500">Outbound campaigns tab - Feature coming soon</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="inbound">
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-gray-500">Inbound opportunities tab - Feature coming soon</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="campaigns">
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-gray-500">Active campaigns tab - Feature coming soon</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="proposals">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Proposals</CardTitle>
                        <CardDescription>
                          Proposals sent for or involving this creator
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {proposals.length > 0 ? (
                            proposals.map((proposal: any, index: number) => (
                              <div 
                                key={proposal.id || index} 
                                className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer transition-colors group"
                                onClick={() => setLocation(`/proposals/${proposal.id}`)}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <div className="font-medium group-hover:text-blue-600">{proposal.name || proposal.title}</div>
                                    <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {proposal.created_at ? new Date(proposal.created_at).toLocaleDateString() : 'Date not available'}
                                    </div>
                                    {proposal.description && (
                                      <div className="text-sm text-gray-600 mt-1">{proposal.description}</div>
                                    )}
                                    {proposal.contactCompany && (
                                      <div className="text-sm text-gray-500 mt-1">
                                        For: {proposal.contactCompany}
                                      </div>
                                    )}
                                  </div>
                                  <Badge variant={proposal.status === 'published' || proposal.status === 'live' ? 'default' : 'secondary'}>
                                    {proposal.status || 'Draft'}
                                  </Badge>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500">No proposals found for this creator.</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="content">
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-gray-500">Content inventory tab - Feature coming soon</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="emails">
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-gray-500">Email accounts tab - Feature coming soon</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="timeline">
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-gray-500">Activity timeline tab - Feature coming soon</p>
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