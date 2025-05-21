import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, BookOpen, Youtube } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ScrollReveal } from "@/components/ScrollReveal";
import { supabase } from "@/integrations/supabase/client"; // adjust path if needed

// Empty initial resources
const initialResources = {
  documents: [],
  videos: []
};

const categories = [
  "All",
  "Taxation",
  "Financial Reporting",
  "Audit",
  "Cost Accounting",
  "Corporate Law",
  "Economics"
];

// Utility to extract YouTube video ID
function getYouTubeId(url: string) {
  // Handles youtube.com/watch?v=, youtu.be/, youtube.com/embed/, youtube.com/shorts/
  const regExp = /(?:youtube\.com\/(?:.*v=|(?:v|embed|shorts)\/)|youtu\.be\/)([\w-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

const Resources = () => {
  const { toast } = useToast();
  const [resources, setResources] = useState(initialResources);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [newDocument, setNewDocument] = useState({
    title: "",
    category: "",
    file: null as File | null
  });
  const [newVideo, setNewVideo] = useState({
    title: "",
    url: "",
    duration: "",
    ca_level: "",
    subject: ""
  });
  const [selectedLevel, setSelectedLevel] = useState("All");

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (error) {
          setIsAdmin(false);
        } else if (data && "is_admin" in data) {
          setIsAdmin((data as any).is_admin === true);
        } else {
          setIsAdmin(false);
        }
      }
    };
    fetchProfile();
  }, []);

  const filteredDocuments = resources.documents.filter(doc =>
    (selectedLevel === "All" || doc.ca_level === selectedLevel) &&
    (selectedCategory === "All" || doc.category === selectedCategory) &&
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVideos = resources.videos.filter(video =>
    (selectedLevel === "All" || video.ca_level === selectedLevel) &&
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDocumentUpload = () => {
    if (!newDocument.title || !newDocument.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // In a real application, we would handle the file upload to storage
    // For now, we'll just update the local state
    
    const newDoc = {
      id: `doc-${Date.now()}`,
      title: newDocument.title,
      category: newDocument.category,
      type: "PDF",
      size: newDocument.file ? `${(newDocument.file.size / (1024 * 1024)).toFixed(1)} MB` : "0 MB",
      uploadDate: new Date().toISOString().split('T')[0],
      url: "#",
      thumbnailUrl: "/placeholder.svg"
    };
    
    setResources({
      ...resources,
      documents: [...resources.documents, newDoc]
    });
    
    setIsUploadingDocument(false);
    
    toast({
      title: "Document Uploaded",
      description: `"${newDocument.title}" has been added to resources`,
    });
    
    // Reset form
    setNewDocument({
      title: "",
      category: "",
      file: null
    });
  };

  const handleVideoAdd = () => {
    if (!newVideo.title || !newVideo.url) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const newVid = {
      id: `vid-${Date.now()}`,
      title: newVideo.title,
      duration: newVideo.duration || "00:00",
      uploadDate: new Date().toISOString().split('T')[0],
      url: newVideo.url,
      thumbnailUrl: "/placeholder.svg",
      ca_level: newVideo.ca_level
    };
    
    setResources({
      ...resources,
      videos: [...resources.videos, newVid]
    });
    
    setIsAddingVideo(false);
    
    toast({
      title: "Video Added",
      description: `"${newVideo.title}" has been added to resources`,
    });
    
    // Reset form
    setNewVideo({
      title: "",
      url: "",
      duration: "",
      ca_level: "",
      subject: ""
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNewDocument({ ...newDocument, file });
  };

  return (
    <div className="container py-8 md:py-12">
      <ScrollReveal>
        <h1 className="text-3xl font-bold mb-8">Study Resources</h1>
      </ScrollReveal>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2">
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="mb-4 flex gap-4 items-center">
        <label className="font-medium">CA Level:</label>
        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select CA Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Foundation">Foundation</SelectItem>
            <SelectItem value="Inter">Inter</SelectItem>
            <SelectItem value="Final">Final</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Add YouTube Video Button and Dialog (visible to all users) */}
      {isAdmin && (
        <div className="flex gap-4 mb-8">
          <Dialog open={isAddingVideo} onOpenChange={setIsAddingVideo}>
            <DialogTrigger asChild>
              <Button variant="outline">Add YouTube Video</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add YouTube Video</DialogTitle>
                <DialogDescription>
                  Add a new YouTube video resource for students. Paste a valid YouTube link to see a preview.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="video-title">Title</Label>
                  <Input
                    id="video-title"
                    value={newVideo.title}
                    onChange={(e) => setNewVideo({...newVideo, title: e.target.value})}
                    placeholder="e.g., GST Calculation Tutorial"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="video-ca-level">CA Level</Label>
                  <Select
                    value={newVideo.ca_level}
                    onValueChange={(value) => setNewVideo({ ...newVideo, ca_level: value })}
                  >
                    <SelectTrigger id="video-ca-level">
                      <SelectValue placeholder="Select CA Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Foundation">Foundation</SelectItem>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Final">Final</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newVideo.ca_level === "Foundation" && (
                  <div className="grid gap-2">
                    <Label htmlFor="video-subject">Subject</Label>
                    <Select
                      value={newVideo.subject}
                      onValueChange={(value) => setNewVideo({ ...newVideo, subject: value })}
                    >
                      <SelectTrigger id="video-subject">
                        <SelectValue placeholder="Select Subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Accounting">Accounting</SelectItem>
                        <SelectItem value="Business Laws">Business Laws</SelectItem>
                        <SelectItem value="Quantitative">Quantitative</SelectItem>
                        <SelectItem value="Business Economic">Business Economic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="video-url">YouTube URL</Label>
                  <Input
                    id="video-url"
                    value={newVideo.url}
                    onChange={(e) => setNewVideo({...newVideo, url: e.target.value})}
                    placeholder="e.g., https://youtube.com/watch?v=..."
                  />
                  {/* Show error if not valid */}
                  {newVideo.url && !getYouTubeId(newVideo.url) && (
                    <span className="text-red-500 text-xs">Please enter a valid YouTube URL.</span>
                  )}
                  {/* Show preview if valid */}
                  {getYouTubeId(newVideo.url) && (
                    <div className="mt-2">
                      <iframe
                        width="100%"
                        height="220"
                        src={`https://www.youtube.com/embed/${getYouTubeId(newVideo.url)}`}
                        title={newVideo.title || 'YouTube Preview'}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-56 rounded"
                      />
                    </div>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="video-duration">Duration (Optional)</Label>
                  <Input
                    id="video-duration"
                    value={newVideo.duration}
                    onChange={(e) => setNewVideo({...newVideo, duration: e.target.value})}
                    placeholder="e.g., 45:30"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleVideoAdd}
                  disabled={
                    !newVideo.title ||
                    !getYouTubeId(newVideo.url) ||
                    !newVideo.ca_level ||
                    (newVideo.ca_level === "Foundation" && !newVideo.subject)
                  }
                >
                  Add YouTube Video
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
      
      <Tabs defaultValue="documents">
        <TabsList className="mb-6">
          <TabsTrigger value="documents">
            <BookOpen className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="videos">
            <Youtube className="h-4 w-4 mr-2" />
            Videos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="documents">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No documents found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? `No results for "${searchQuery}"`
                  : "No documents available. Add your first document!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((document, i) => (
                <ScrollReveal delay={0.1 + i * 0.05}>
                  <Card key={document.id} className="overflow-hidden">
                    <div className="aspect-video relative bg-muted flex items-center justify-center">
                      <img 
                        src={document.thumbnailUrl} 
                        alt={document.title}
                        className="object-cover h-40 w-full"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Button variant="secondary">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <CardHeader className="py-4">
                      <CardTitle className="text-lg">{document.title}</CardTitle>
                      <CardDescription>{document.category}</CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-between py-3">
                      <span className="text-sm text-muted-foreground">
                        {document.type} • {document.size}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {document.uploadDate}
                      </span>
                    </CardFooter>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="videos">
          {filteredVideos.length === 0 ? (
            <div className="text-center py-12">
              <Youtube className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No videos found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? `No results for "${searchQuery}"`
                  : "No videos available. Add your first video!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video, i) => {
                const ytId = getYouTubeId(video.url);
                return (
                  <ScrollReveal delay={0.1 + i * 0.05} key={video.id}>
                    <Card className="overflow-hidden">
                      <div className="aspect-video relative bg-muted flex items-center justify-center">
                        {ytId ? (
                          <iframe
                            width="100%"
                            height="220"
                            src={`https://www.youtube.com/embed/${ytId}`}
                            title={video.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-56"
                          />
                        ) : (
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="object-cover w-full"
                          />
                        )}
                      </div>
                      <CardHeader className="py-4">
                        <CardTitle className="text-lg">{video.title}</CardTitle>
                        <CardDescription>{video.category}</CardDescription>
                      </CardHeader>
                      <CardFooter className="flex justify-between py-3">
                        <span className="text-sm text-muted-foreground">
                          Duration: {video.duration}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {video.uploadDate}
                        </span>
                      </CardFooter>
                    </Card>
                  </ScrollReveal>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Resources;
