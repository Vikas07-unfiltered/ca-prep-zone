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
import type { Database } from "@/integrations/supabase/types";

type NoteRow = Database["public"]["Tables"]["resources_notes"]["Row"];
type NoteInsert = Database["public"]["Tables"]["resources_notes"]["Insert"];
type PptRow = Database["public"]["Tables"]["resources_ppts"]["Row"];
type PptInsert = Database["public"]["Tables"]["resources_ppts"]["Insert"];

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
  // State for Notes links
  // Notes from Supabase, grouped by title
  const [noteGroups, setNoteGroups] = useState<Record<string, { id: string; teacher: string; url: string }[]>>({});
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteUrl, setNewNoteUrl] = useState("");
  const [newNoteTeacher, setNewNoteTeacher] = useState("");
  const [loadingNotes, setLoadingNotes] = useState(false);

  // PPTs from Supabase, grouped by title
  const [pptGroups, setPptGroups] = useState<Record<string, { id: string; teacher: string; url: string; is_pdf: boolean }[]>>({});
  const [newPptTitle, setNewPptTitle] = useState("");
  const [newPptUrl, setNewPptUrl] = useState("");
  const [newPptTeacher, setNewPptTeacher] = useState("");
  const [newPptFile, setNewPptFile] = useState<File | null>(null);
  const [loadingPpts, setLoadingPpts] = useState(false);

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

  // Handlers for adding links
  const handleAddNoteLink = async () => {
    if (!newNoteTitle.trim() || !newNoteUrl.trim() || !newNoteTeacher.trim()) return;
    setLoadingNotes(true);
    const { data, error } = await supabase
      .from('resources_notes')
      .insert([{ title: newNoteTitle, teacher: newNoteTeacher, url: newNoteUrl }])
      .select();
    setLoadingNotes(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    if (data && data.length > 0) {
      // Insert the new note into the correct group
      setNoteGroups(prev => {
        const group = prev[newNoteTitle] ? [...prev[newNoteTitle]] : [];
        const note = data[0];
        if (note && typeof note === 'object' && 'id' in note) {
          group.push({ id: (note as NoteRow).id, teacher: newNoteTeacher, url: newNoteUrl });
        }
        return { ...prev, [newNoteTitle]: group };
      });
    }
    setNewNoteTitle("");
    setNewNoteUrl("");
    setNewNoteTeacher("");
    toast({ title: 'Note Added', description: 'Note added successfully!' });
  };

  const handleAddPptResource = async () => {
    if (!newPptTitle.trim() || !newPptTeacher.trim() || (!newPptUrl.trim() && !newPptFile)) return;
    setLoadingPpts(true);
    let resourceUrl = newPptUrl;
    let isPdf = false;
    // If a file is selected, upload to Supabase Storage
    if (newPptFile) {
      const fileExt = newPptFile.name.split('.').pop();
      const fileName = `${Date.now()}_${newPptFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('ppt-pdfs').upload(fileName, newPptFile, { contentType: 'application/pdf' });
      if (uploadError) {
        setLoadingPpts(false);
        toast({ title: 'Upload Error', description: uploadError.message, variant: 'destructive' });
        return;
      }
      // Get the public URL
      const { data: publicUrlData } = supabase.storage.from('ppt-pdfs').getPublicUrl(fileName);
      resourceUrl = publicUrlData?.publicUrl || '';
      isPdf = true;
    }
    const { data, error } = await supabase
      .from('resources_ppts')
      .insert([{ title: newPptTitle, teacher: newPptTeacher, url: resourceUrl, is_pdf: isPdf }])
      .select();
    setLoadingPpts(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    if (data && data.length > 0) {
      setPptGroups(prev => {
        const group = prev[newPptTitle] ? [...prev[newPptTitle]] : [];
        const ppt = data[0];
        if (ppt && typeof ppt === 'object' && 'id' in ppt) {
          group.push({ id: (ppt as PptRow).id, teacher: newPptTeacher, url: resourceUrl, is_pdf: isPdf });
        }
        return { ...prev, [newPptTitle]: group };
      });
    }
    setNewPptTitle("");
    setNewPptUrl("");
    setNewPptTeacher("");
    setNewPptFile(null);
    toast({ title: 'PPT Added', description: 'PPT added successfully!' });
  };

  // Fetch notes and PPTs from Supabase
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

    const fetchNotes = async () => {
      setLoadingNotes(true);
      const { data, error } = await supabase
        .from('resources_notes')
        .select('*');
      setLoadingNotes(false);
      if (!error && data) {
        // Group notes by title
        const grouped: Record<string, { id: string; teacher: string; url: string }[]> = {};
        data.forEach((note: any) => {
          if (!grouped[note.title]) grouped[note.title] = [];
          grouped[note.title].push({ id: note.id, teacher: note.teacher, url: note.url });
        });
        setNoteGroups(grouped);
      }
    };

    const fetchPpts = async () => {
      setLoadingPpts(true);
      const { data, error } = await supabase
        .from('resources_ppts')
        .select('*');
      setLoadingPpts(false);
      if (!error && data) {
        // Group ppts by title
        const grouped: Record<string, { id: string; teacher: string; url: string; is_pdf: boolean }[]> = {};
        data.forEach((ppt: any) => {
          if (!grouped[ppt.title]) grouped[ppt.title] = [];
          grouped[ppt.title].push({ id: ppt.id, teacher: ppt.teacher, url: ppt.url, is_pdf: ppt.is_pdf });
        });
        setPptGroups(grouped);
      }
    };

    fetchProfile();
    fetchNotes();
    fetchPpts();
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data, error } = await (supabase as any)
        .from('videos')
        .select('*');
      if (!error && data) {
        setResources((prev) => ({
          ...prev,
          videos: data
        }));
      }
    };
    fetchVideos();
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

  const handleVideoAdd = async () => {
    if (!newVideo.title || !getYouTubeId(newVideo.url) || !newVideo.ca_level || (newVideo.ca_level === "Foundation" && !newVideo.subject)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Prepare the video object
    const videoToInsert = {
      title: newVideo.title,
      url: newVideo.url,
      duration: newVideo.duration || "00:00",
      ca_level: newVideo.ca_level,
      subject: newVideo.ca_level === "Foundation" ? newVideo.subject : null,
      uploadDate: new Date().toISOString().split('T')[0],
      thumbnailUrl: "/placeholder.svg"
    };

    // Insert into Supabase
    const { data, error } = await (supabase as any)
      .from('videos')
      .insert([videoToInsert])
      .select();

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Optionally, update local state to show the new video immediately
    setResources((prev) => ({
      ...prev,
      videos: [...prev.videos, ...(data || [])]
    }));

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
      
      <Tabs defaultValue="notes" className="mt-8">
        <TabsList className="mb-6">
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="ppts">PPTs</TabsTrigger>
          <TabsTrigger value="youtube">YouTube</TabsTrigger>
          <TabsTrigger value="fun-games">Fun Games</TabsTrigger>
        </TabsList>
        
        <TabsContent value="notes">
        {/* Notes Tab: List of note links */}
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-4">Notes</h3>
          {isAdmin && (
            <div className="flex flex-col items-start w-full">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mb-4">Add Note Link</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Note Link</DialogTitle>
                    <DialogDescription>Enter the title, teacher, and URL for the note.</DialogDescription>
                  </DialogHeader>
                  <Input
                    placeholder="Title"
                    value={newNoteTitle}
                    onChange={e => setNewNoteTitle(e.target.value)}
                    className="mb-2"
                  />
                  <Input
                    placeholder="URL"
                    value={newNoteUrl}
                    onChange={e => setNewNoteUrl(e.target.value)}
                    className="mb-2"
                  />
                  <Input
                    placeholder="Teacher"
                    value={newNoteTeacher}
                    onChange={e => setNewNoteTeacher(e.target.value)}
                    className="mb-2"
                  />
                  <DialogFooter>
                    <Button onClick={handleAddNoteLink} disabled={loadingNotes}>Add</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
          <div className="flex flex-col gap-6 w-full mt-4">
            {Object.entries(noteGroups).map(([title, notes], idx) => (
              <div key={title} className="rounded-lg border bg-card text-card-foreground shadow p-5 w-full">
                <div className="flex items-center mb-3">
                  <span className="text-lg font-semibold text-primary mr-2">{idx + 1}.</span>
                  <span className="text-lg font-semibold text-primary">{title}</span>
                </div>
                <ul className="ml-6 space-y-2">
                  {notes.map((note, subIdx) => (
                    <li key={subIdx} className="flex items-center gap-2">
                      <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground font-semibold mr-2">
                        {String.fromCharCode(97 + subIdx)}
                      </span>
                      <span className="flex items-center gap-1 text-sm">
                        <span className="inline-flex items-center gap-1 text-gray-700 font-medium">
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block align-middle text-blue-500" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5Z"/></svg>
                          {note.teacher}
                        </span>
                        <span className="text-gray-400 mx-1">—</span>
                        <a href={note.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all inline-flex items-center gap-1">
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block align-middle text-blue-400" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 1 7 7l-1 1a5 5 0 0 1-7-7"/><path d="M8 11a5 5 0 0 1 7-7l1 1a5 5 0 0 1-7 7"/><line x1="8" x2="16" y1="8" y2="16"/></svg>
                          {note.url}
                        </a>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>
      <TabsContent value="ppts">
        {/* PPTs Tab: List of PPT links */}
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-4">PPTs</h3>
          {isAdmin && (
            <div className="flex flex-col items-start w-full">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mb-4">Add PPT Resource</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add PPT Resource</DialogTitle>
                    <DialogDescription>Enter the title, teacher, and URL or upload a PDF for the PPT.</DialogDescription>
                  </DialogHeader>
                  <Input
                    placeholder="Title"
                    value={newPptTitle}
                    onChange={e => setNewPptTitle(e.target.value)}
                    className="mb-2"
                  />
                  <Input
                    placeholder="URL"
                    value={newPptUrl}
                    onChange={e => setNewPptUrl(e.target.value)}
                    className="mb-2"
                  />
                  <Input
                    placeholder="Teacher"
                    value={newPptTeacher}
                    onChange={e => setNewPptTeacher(e.target.value)}
                    className="mb-2"
                  />
                  <div className="mb-2 flex flex-col gap-2">
                    <label className="font-medium">Or upload PDF</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={e => setNewPptFile(e.target.files?.[0] || null)}
                    />
                    {newPptFile && (
                      <span className="text-xs text-green-600">Selected: {newPptFile.name}</span>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleAddPptResource}
                      disabled={loadingPpts || (!newPptUrl.trim() && !newPptFile) || !newPptTitle.trim() || !newPptTeacher.trim()}
                    >
                      Add
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
          <div className="flex flex-col gap-6 w-full mt-4">
            {Object.entries(pptGroups).map(([title, ppts], idx) => (
              <div key={title} className="rounded-lg border bg-card text-card-foreground shadow p-5 w-full">
                <div className="flex items-center mb-3">
                  <span className="text-lg font-semibold text-primary mr-2">{idx + 1}.</span>
                  <span className="text-lg font-semibold text-primary">{title}</span>
                </div>
                <ul className="ml-6 space-y-2">
                  {ppts.map((ppt, subIdx) => (
                    <li key={subIdx} className="flex items-center gap-2">
                      <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground font-semibold mr-2">
                        {String.fromCharCode(97 + subIdx)}
                      </span>
                      <span className="flex items-center gap-1 text-sm">
                        <span className="inline-flex items-center gap-1 text-gray-700 font-medium">
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block align-middle text-blue-500" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5Z"/></svg>
                          {ppt.teacher}
                        </span>
                        <span className="text-gray-400 mx-1">—</span>
                        {ppt.is_pdf ? (
                          <a href={ppt.url} target="_blank" rel="noopener noreferrer" className="text-green-700 underline break-all inline-flex items-center gap-1">
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block align-middle text-green-600" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5Z"/></svg>
                            PDF
                          </a>
                        ) : (
                          <a href={ppt.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all inline-flex items-center gap-1">
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block align-middle text-blue-400" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 1 7 7l-1 1a5 5 0 0 1-7-7"/><path d="M8 11a5 5 0 0 1 7-7l1 1a5 5 0 0 1-7 7"/><line x1="8" x2="16" y1="8" y2="16"/></svg>
                            {ppt.url}
                          </a>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>
      <TabsContent value="youtube">
        {/* YouTube Tab: Show YouTube videos */}
        {filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <Youtube className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No YouTube videos found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? `No results for "${searchQuery}"`
                : "No YouTube videos available. Add your first video!"}
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
      <TabsContent value="fun-games">
        {/* Fun Games Tab: List of fun/educational games */}
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-4">Fun Games</h3>
          <ul className="space-y-3 max-w-xl mx-auto">
            {/* Add your fun/educational game links here */}
          </ul>
        </div>
      </TabsContent>
    </Tabs>
  </div>
);
}
export default Resources;
