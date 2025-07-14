import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Building, ExternalLink, Eye, Filter, Mail, MoreVertical, Plus, Search, Trash2, Upload, X, Users, AlertTriangle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Contact, ContactList } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CSVUploader } from "@/components/campaign/csv-uploader";
import { AddContactModal } from "@/components/contact/add-contact-modal";
import { EditContactModal } from "@/components/contact/edit-contact-modal";
import { ContactDetailModal } from "@/components/contact/contact-detail-modal";
import { EditableCell } from "@/components/contact/editable-cell";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Contacts() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string | null>(null);
  const [nicheFilter, setNicheFilter] = useState<string | null>(null);
  const [uniqueIndustries, setUniqueIndustries] = useState<string[]>([]);
  const [uniqueNiches, setUniqueNiches] = useState<string[]>([]);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  
  const { data: contacts, isLoading: isLoadingContacts } = useQuery<Contact[]>({
    queryKey: ['/api/contacts'],
  });

  // AI-powered duplicate detection function
  const findDuplicates = async () => {
    if (!contacts || contacts.length === 0) {
      toast({
        title: "No contacts",
        description: "No contacts available to analyze for duplicates.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await apiRequest("POST", "/api/contacts/find-duplicates", {
        contacts: contacts
      });
      
      setDuplicates(response.duplicates || []);
      setIsDuplicateModalOpen(true);
      
      toast({
        title: "Analysis complete",
        description: `Found ${response.duplicates?.length || 0} potential duplicate groups.`,
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Failed to analyze contacts for duplicates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const { data: contactLists, isLoading: isLoadingLists } = useQuery<ContactList[]>({
    queryKey: ['/api/contact-lists'],
  });
  
  // Extract unique industry and niche values from contacts
  useEffect(() => {
    if (contacts) {
      // Get all industries and niches, then create a Set to get unique values
      const industriesSet = new Set<string>();
      const nichesSet = new Set<string>();
      
      contacts.forEach(contact => {
        if (contact.industry) {
          industriesSet.add(contact.industry);
        }
        if (contact.niche) {
          nichesSet.add(contact.niche);
        }
      });
      
      // Convert Sets to arrays, filter out falsy values, and sort
      const industries = Array.from(industriesSet).filter(Boolean) as string[];
      const niches = Array.from(nichesSet).filter(Boolean) as string[];
      
      setUniqueIndustries(industries.sort());
      setUniqueNiches(niches.sort());
    }
  }, [contacts]);
  
  // Filter contacts based on search term, niche, and industry filter
  const filteredContacts = contacts?.filter(contact => {
    const matchesSearch = searchTerm === '' || 
      Object.values(contact).some(value => 
        value && typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesIndustry = !industryFilter || industryFilter === 'all' || contact.industry === industryFilter;
    const matchesNiche = !nicheFilter || nicheFilter === 'all' || contact.niche === nicheFilter;
    
    return matchesSearch && matchesIndustry && matchesNiche;
  });

  const handleCsvUpload = async (csvData: any[], listName: string) => {
    try {
      console.log("Starting contact upload:", { contactCount: csvData.length, listName });
      
      const response = await apiRequest("POST", "/api/contacts/batch", {
        contacts: csvData,
        listName: listName
      });
      
      console.log("Upload response:", response);
      
      // Force refresh of data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/api/contacts'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/contact-lists'] })
      ]);
      
      toast({
        title: "Contacts uploaded successfully!",
        description: `Successfully uploaded ${csvData.length} contacts to "${listName}" list.`,
      });
      
      setIsUploadDialogOpen(false);
      
      return response;
    } catch (error) {
      console.error("Contact upload error:", error);
      toast({
        title: "Upload failed",
        description: `Error uploading contacts: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      throw error; // Re-throw so the CSVUploader can handle it
    }
  };

  const handleDeleteContact = async (contactId: number, contactName: string) => {
    try {
      await apiRequest("DELETE", `/api/contacts/${contactId}`);
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      
      toast({
        title: "Contact deleted",
        description: `${contactName} was deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete contact. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 flex flex-col h-[calc(100vh-64px)]">
      {/* Page header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Contacts</h1>
          <p className="mt-2 text-base text-gray-600">Manage your contact lists for campaigns</p>
        </div>
        <div className="flex gap-2">
          {/* Add Contact Button */}
          <AddContactModal />
          
          {/* Upload Contacts Button */}
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <Upload className="mr-2 h-4 w-4" />
                Upload Contacts
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Upload contacts</DialogTitle>
                <DialogDescription>
                  Upload a CSV or Excel (XLSX/XLS) file with your contacts. The file must include columns for Industry, First Name, Email, and Company.
                  The file can also include a Type/Niche column to categorize contacts.
                  You can drag and drop your file directly onto the upload area below.
                </DialogDescription>
              </DialogHeader>
              <CSVUploader onUploadComplete={handleCsvUpload} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Duplicate Detection Results Modal */}
      <Dialog open={isDuplicateModalOpen} onOpenChange={setIsDuplicateModalOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Duplicate Detection Results
            </DialogTitle>
            <DialogDescription>
              Review potential duplicate contacts found by AI analysis. You can manually remove or merge duplicates.
            </DialogDescription>
          </DialogHeader>
          
          {duplicates.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Duplicates Found</h3>
              <p className="text-gray-500">Your contact list looks clean! No potential duplicates were detected.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {duplicates.map((group, groupIndex) => (
                <div key={groupIndex} className="border rounded-lg p-4 bg-yellow-50">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    Duplicate Group {groupIndex + 1} ({group.contacts?.length || 0} contacts)
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    <strong>Reason:</strong> {group.reason || 'Similar name, email, or company/role combination'}
                  </p>
                  
                  <div className="space-y-2">
                    {group.contacts?.map((contact: any, contactIndex: number) => (
                      <div key={contact.id} className="flex items-center justify-between bg-white p-3 rounded border">
                        <div className="flex-1">
                          <div className="font-medium">{contact.firstName} {contact.lastName}</div>
                          <div className="text-sm text-gray-600">{contact.email}</div>
                          <div className="text-sm text-gray-500">{contact.company} - {contact.role}</div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteContact(contact.id)}
                          className="ml-4"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    )) || []}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Contacts and Lists Tabs */}
      <Tabs defaultValue="contacts" className="w-full flex-1 flex flex-col">
        <TabsList className="mb-4">
          <TabsTrigger value="contacts">All Contacts</TabsTrigger>
          <TabsTrigger value="lists">Contact Lists</TabsTrigger>
        </TabsList>
        
        <TabsContent value="contacts" className="flex-1 flex flex-col">
          <Card className="flex-1 flex flex-col shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 pb-6 bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 border-b-2 border-gradient-to-r from-blue-200 to-purple-200">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-xl ring-2 ring-blue-100">
                  <Users className="h-6 w-6 text-white drop-shadow-sm" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">All Contacts</CardTitle>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <p className="text-sm font-medium text-gray-700">
                        <span className="font-bold text-blue-600 text-lg">{contacts?.length || 0}</span> 
                        <span className="text-gray-500"> total</span>
                      </p>
                    </div>
                    {filteredContacts && filteredContacts.length !== contacts?.length && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <p className="text-sm font-medium text-gray-700">
                          <span className="font-bold text-green-600">{filteredContacts.length}</span>
                          <span className="text-gray-500"> showing</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                {/* Enhanced Search Box */}
                <div className="relative flex items-center gap-2 w-full md:w-auto">
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search contacts by name, email, company..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-10 w-full bg-white/90 border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg transition-all"
                    />
                    {searchTerm && (
                      <X
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                        onClick={() => setSearchTerm('')}
                      />
                    )}
                  </div>
                </div>
                
                {/* Enhanced Niche Filter */}
                <div className="w-full md:w-48">
                  <Select 
                    value={nicheFilter || 'all'} 
                    onValueChange={(value) => setNicheFilter(value === 'all' ? null : value)}
                  >
                    <SelectTrigger className="bg-white/90 border-gray-200 shadow-sm hover:bg-white transition-all rounded-lg">
                      <Filter className="h-4 w-4 mr-2 text-gray-500" />
                      <SelectValue placeholder="Filter by niche" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 shadow-lg rounded-lg">
                      <SelectItem value="all" className="hover:bg-blue-50">All Niches</SelectItem>
                      {uniqueNiches.map(niche => (
                        <SelectItem key={niche} value={niche} className="hover:bg-blue-50">{niche}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Enhanced Industry Filter */}
                <div className="w-full md:w-52">
                  <Select 
                    value={industryFilter || 'all'} 
                    onValueChange={(value) => setIndustryFilter(value === 'all' ? null : value)}
                  >
                    <SelectTrigger className="bg-white/90 border-gray-200 shadow-sm hover:bg-white transition-all rounded-lg">
                      <Building className="h-4 w-4 mr-2 text-gray-500" />
                      <SelectValue placeholder="Filter by industry" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 shadow-lg rounded-lg">
                      <SelectItem value="all" className="hover:bg-blue-50">All Industries</SelectItem>
                      {uniqueIndustries.map(industry => (
                        <SelectItem key={industry} value={industry} className="hover:bg-blue-50">{industry}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Reset Filters */}
                {(searchTerm || industryFilter || nicheFilter) && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setSearchTerm('');
                      setIndustryFilter(null);
                      setNicheFilter(null);
                    }}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Active Filters Display */}
              {((industryFilter && industryFilter !== 'all') || (nicheFilter && nicheFilter !== 'all')) && (
                <div className="flex items-center gap-2 mb-4 px-6">
                  <span className="text-sm text-gray-500">Active filters:</span>
                  
                  {nicheFilter && nicheFilter !== 'all' && (
                    <Badge className="bg-primary-DEFAULT text-white">
                      Niche: {nicheFilter}
                      <X 
                        className="ml-1 h-3 w-3 cursor-pointer"
                        onClick={() => setNicheFilter(null)}
                      />
                    </Badge>
                  )}
                  
                  {industryFilter && industryFilter !== 'all' && (
                    <Badge className="bg-primary-DEFAULT text-white">
                      Industry: {industryFilter}
                      <X 
                        className="ml-1 h-3 w-3 cursor-pointer"
                        onClick={() => setIndustryFilter(null)}
                      />
                    </Badge>
                  )}
                </div>
              )}
            
              {isLoadingContacts ? (
                <div className="flex-1 flex justify-center items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="border-t flex-1">
                  <div className="overflow-x-auto h-full min-h-[70vh] overflow-y-auto">
                    <Table style={{ minWidth: '1400px' }}>
                    <TableHeader className="sticky top-0 bg-gradient-to-r from-slate-50 to-gray-50 z-10 border-b-2 border-gray-200">
                      <TableRow>
                        <TableHead className="w-[120px] font-semibold text-gray-700 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>Niche</span>
                          </div>
                        </TableHead>
                        <TableHead className="w-[140px] font-semibold text-gray-700 py-4">Industry</TableHead>
                        <TableHead className="w-[160px] font-semibold text-gray-700 py-4">Company</TableHead>
                        <TableHead className="w-[100px] font-semibold text-gray-700 py-4">Country</TableHead>
                        <TableHead className="w-[180px] font-semibold text-gray-700 py-4">Website</TableHead>
                        <TableHead className="w-[200px] font-semibold text-gray-700 py-4">Business Email</TableHead>
                        <TableHead className="w-[120px] font-semibold text-gray-700 py-4">First Name</TableHead>
                        <TableHead className="w-[120px] font-semibold text-gray-700 py-4">Last Name</TableHead>
                        <TableHead className="w-[140px] font-semibold text-gray-700 py-4">Role</TableHead>
                        <TableHead className="w-[200px] font-semibold text-gray-700 py-4">Email</TableHead>
                        <TableHead className="w-[180px] font-semibold text-gray-700 py-4">LinkedIn</TableHead>
                        <TableHead className="w-[100px] font-semibold text-gray-700 py-4">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* 🔒 DO NOT REMOVE - In-place editing for Contacts */}
                      {filteredContacts && filteredContacts.length > 0 ? (
                        filteredContacts.map((contact, index) => (
                          <TableRow key={contact.id} className={`hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200 ${index % 2 === 0 ? 'bg-gray-50/30' : 'bg-white'}`}>
                            <TableCell className="py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {contact.niche || 'N/A'}
                              </span>
                            </TableCell>
                            <TableCell className="py-4 font-medium text-gray-900">{contact.industry || '-'}</TableCell>
                            <TableCell className="py-4">
                              <EditableCell 
                                contact={contact} 
                                field="company" 
                                value={contact.company} 
                                className="font-medium text-gray-900" 
                              />
                            </TableCell>
                            <TableCell className="py-4 text-gray-600">{contact.country || '-'}</TableCell>
                            <TableCell>
                              {contact.website ? (
                                <a 
                                  href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary-DEFAULT hover:underline text-sm truncate max-w-[100px] inline-block"
                                >
                                  {contact.website}
                                </a>
                              ) : '-'}
                            </TableCell>
                            <TableCell>
                              {contact.businessEmail ? (
                                <a 
                                  href={`mailto:${contact.businessEmail}`} 
                                  className="text-primary-DEFAULT hover:underline flex items-center gap-1"
                                >
                                  <Mail className="h-3 w-3" />
                                  <span className="text-sm truncate max-w-[120px]">{contact.businessEmail}</span>
                                </a>
                              ) : '-'}
                            </TableCell>
                            <TableCell className="font-medium">
                              <ContactDetailModal 
                                contact={contact} 
                                trigger={
                                  <Button variant="link" className="p-0 h-auto">
                                    {contact.firstName || '-'}
                                  </Button>
                                } 
                              />
                            </TableCell>
                            <TableCell>
                              <EditableCell 
                                contact={contact} 
                                field="lastName" 
                                value={contact.lastName} 
                              />
                            </TableCell>
                            <TableCell>
                              <EditableCell 
                                contact={contact} 
                                field="role" 
                                value={contact.role} 
                              />
                            </TableCell>
                            <TableCell>
                              <a 
                                href={`mailto:${contact.email}`} 
                                className="text-primary-DEFAULT hover:underline flex items-center gap-1"
                              >
                                <Mail className="h-3 w-3" />
                                <span className="text-sm truncate max-w-[120px]">{contact.email || '-'}</span>
                              </a>
                            </TableCell>
                            <TableCell>
                              {contact.linkedin ? (
                                <a 
                                  href={contact.linkedin.startsWith('http') ? contact.linkedin : `https://${contact.linkedin}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary-DEFAULT hover:text-primary-DEFAULT/80 bg-primary-DEFAULT/10 p-1 rounded"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              ) : '-'}
                            </TableCell>
                            <TableCell>
                              <EditContactModal contact={contact} />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                            No contacts found. Upload a CSV or Excel file to add contacts.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="lists" className="flex-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Contact Lists</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingLists ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contactLists && contactLists.length > 0 ? (
                    contactLists.map((list) => (
                      <Card key={list.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{list.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-500">{list.description || 'No description'}</p>
                          <div className="mt-2 text-xs text-primary font-medium">
                            Created: {new Date(list.createdAt!).toLocaleDateString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-8 text-muted-foreground">
                      No contact lists found. Upload a CSV or Excel file to create a list.
                    </div>
                  )}
                  <div 
                    onClick={() => setIsUploadDialogOpen(true)}
                    className="border border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:text-primary-DEFAULT hover:border-primary-DEFAULT"
                  >
                    <span className="material-icons text-3xl mb-2">add_circle_outline</span>
                    <span className="text-sm font-medium">Create New List</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
