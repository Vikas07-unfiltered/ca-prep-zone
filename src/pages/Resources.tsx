
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, BookOpen, Youtube } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

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

const Resources = () => {
  const { toast } = useToast();
  const [resources, setResources] = useState(initialResources);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // Mock admin state
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [newDocument, setNewDocument] = useState({
    title: "",
    category: "",
    file: null as File | null
  });
  const [newVideo, setNewVideo] = useState({
    title: "",
    category: "",
    url: "",
    duration: ""
  });

  const filteredDocuments = resources.documents.filter(doc => {
    const matchesCategory = selectedCategory === "All" || doc.category === selectedCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredVideos = resources.videos.filter(video => {
    const matchesCategory = selectedCategory === "All" || video.category === selectedCategory;
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
    if (!newVideo.title || !newVideo.category || !newVideo.url) {
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
      category: newVideo.category,
      duration: newVideo.duration || "00:00",
      uploadDate: new Date().toISOString().split('T')[0],
      url: newVideo.url,
      thumbnailUrl: "/placeholder.svg"
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
      category: "",
      url: "",
      duration: ""
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNewDocument({ ...newDocument, file });
  };

  return (
    <div className="container py-8 md:py-12">
      <h1 className="text-3xl font-bold mb-8">Study Resources</h1>
      
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
      
      {isAdmin && (
        <div className="flex gap-4 mb-8">
          <Dialog open={isUploadingDocument} onOpenChange={setIsUploadingDocument}>
            <DialogTrigger asChild>
              <Button>Upload Document</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>
                  Add a new document resource for students.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="doc-title">Title</Label>
                  <Input
                    id="doc-title"
                    value={newDocument.title}
                    onChange={(e) => setNewDocument({...newDocument, title: e.target.value})}
                    placeholder="e.g., Income Tax Guide"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="doc-category">Category</Label>
                  <Select
                    value={newDocument.category}
                    onValueChange={(value) => setNewDocument({...newDocument, category: value})}
                  >
                    <SelectTrigger id="doc-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c !== "All").map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="doc-file">File</Label>
                  <Input
                    id="doc-file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleDocumentUpload}>Upload</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddingVideo} onOpenChange={setIsAddingVideo}>
            <DialogTrigger asChild>
              <Button variant="outline">Add Video</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Video Resource</DialogTitle>
                <DialogDescription>
                  Add a new video resource for students.
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
                  <Label htmlFor="video-category">Category</Label>
                  <Select
                    value={newVideo.category}
                    onValueChange={(value) => setNewVideo({...newVideo, category: value})}
                  >
                    <SelectTrigger id="video-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c !== "All").map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="video-url">Video URL</Label>
                  <Input
                    id="video-url"
                    value={newVideo.url}
                    onChange={(e) => setNewVideo({...newVideo, url: e.target.value})}
                    placeholder="e.g., https://youtube.com/watch?v=..."
                  />
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
                <Button onClick={handleVideoAdd}>Add Video</Button>
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
              {filteredDocuments.map((document) => (
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
              {filteredVideos.map((video) => (
                <Card key={video.id} className="overflow-hidden">
                  <div className="aspect-video relative bg-muted flex items-center justify-center">
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title}
                      className="object-cover w-full"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button variant="secondary" asChild>
                        <a href={video.url} target="_blank" rel="noopener noreferrer">
                          <Youtube className="h-4 w-4 mr-2" />
                          Watch
                        </a>
                      </Button>
                    </div>
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
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Resources;
