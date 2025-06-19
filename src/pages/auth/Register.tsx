import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatedButton } from "@/components/ui/animated-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Doodle } from "@/components/ui/Doodle";

const Register = () => {
  const { toast } = useToast();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  // Import supabase client
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { supabase } = require("@/integrations/supabase/client");

  // Handler for avatar file input
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const getDiceBearUrl = (seed: string) =>
    `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(seed)}`;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !bio) {
      toast({
        title: "Error",
        description: "Please fill in all fields, including your bio.",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    if (!termsAccepted) {
      toast({
        title: "Error",
        description: "Please accept the terms of service and privacy policy",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Sign up user (creates auth user and basic profile)
      const { error } = await signUp(email, password, name);
      
      if (error) {
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Try to get the user id from Supabase after registration
        const { data: userData, error: userError } = await supabase.auth.getUser();
        const userId = userData?.user?.id;
        let avatarUrl = "";
        if (userId) {
          // Upload avatar if provided
          if (avatarFile) {
            const fileExt = avatarFile.name.split('.').pop();
            const filePath = `avatars/${userId}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
              .from('avatars')
              .upload(filePath, avatarFile, { upsert: true });
            if (uploadError) {
              toast({
                title: "Avatar Upload Failed",
                description: uploadError.message,
                variant: "destructive",
              });
            } else {
              const { data: publicUrlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);
              avatarUrl = publicUrlData?.publicUrl || "";
            }
          } else {
            // Use DiceBear avatar
            avatarUrl = getDiceBearUrl(name || email);
          }
          // Update the profile row with the bio and avatarUrl
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ bio, avatar_url: avatarUrl })
            .eq('id', userId);
          if (updateError) {
            toast({
              title: "Profile Update Failed",
              description: updateError.message,
              variant: "destructive",
            });
          }
        }
        toast({
          title: "Success",
          description: "Account created successfully! Please check your email for verification.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="container max-w-md py-16 md:py-24">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="avatar">Profile Picture (optional)</Label>
                <Input 
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
                {avatarPreview && (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar Preview" 
                    style={{ width: 80, height: 80, borderRadius: '50%' }} 
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Must be at least 6 characters long
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  placeholder="Tell us about yourself and your CA journey"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Example: "CA student passionate about audit and taxation. Preparing for finals!"
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{" "}
                  <Link 
                    to="/terms" 
                    className="text-primary hover:underline"
                  >
                    terms of service
                  </Link>{" "}
                  and{" "}
                  <Link 
                    to="/privacy" 
                    className="text-primary hover:underline"
                  >
                    privacy policy
                  </Link>
                </label>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <AnimatedButton 
                type="submit"
                className="w-full" 
                disabled={isLoading}
                hoverScale={1.02}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </AnimatedButton>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
      <div className="fixed bottom-4 right-4 z-0 opacity-60 pointer-events-none select-none">
        <Doodle name="law" className="w-40 h-40" />
      </div>
    </div>
  );
};

export default Register;
