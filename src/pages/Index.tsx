import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Users, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
const Index = () => {
  const {
    user
  } = useAuth();
  return <div>
      {/* Hero Section */}
      <section className="py-20 md:py-24 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">Master Your CA Studies with Unfiltered CA</h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              {!user ? <>
                  <Link to="/register">
                    <Button size="lg">Get Started</Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg">
                      Sign In
                    </Button>
                  </Link>
                </> : <Link to="/tools">
                  <Button size="lg">Access Study Tools</Button>
                </Link>}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Study Tools Designed for CA Students
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground">
                Everything you need to excel in your chartered accountancy studies, all in one place.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:gap-12">
            <div className="flex flex-col items-start space-y-4 rounded-lg border bg-background p-6">
              <div className="rounded-full bg-primary/10 p-3">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Pomodoro Timer</h3>
              <p className="text-muted-foreground">
                Stay focused with customizable study intervals. Track subjects and analyze your study patterns.
              </p>
              {user ? <Link to="/timer">
                  <Button variant="outline">Try Timer</Button>
                </Link> : <Link to="/login">
                  <Button variant="outline">Sign In to Access</Button>
                </Link>}
            </div>
            <div className="flex flex-col items-start space-y-4 rounded-lg border bg-background p-6">
              <div className="rounded-full bg-primary/10 p-3">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Study Planner</h3>
              <p className="text-muted-foreground">
                Plan your study sessions with our calendar tool. Set goals and track your progress over time.
              </p>
              {user ? <Link to="/planner">
                  <Button variant="outline">Explore Planner</Button>
                </Link> : <Link to="/login">
                  <Button variant="outline">Sign In to Access</Button>
                </Link>}
            </div>
            <div className="flex flex-col items-start space-y-4 rounded-lg border bg-background p-6">
              <div className="rounded-full bg-primary/10 p-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Study Rooms</h3>
              <p className="text-muted-foreground">
                Join or create virtual study rooms. Chat with fellow students and stay motivated together.
              </p>
              {user ? <Link to="/rooms">
                  <Button variant="outline">Join Room</Button>
                </Link> : <Link to="/login">
                  <Button variant="outline">Sign In to Access</Button>
                </Link>}
            </div>
            <div className="flex flex-col items-start space-y-4 rounded-lg border bg-background p-6">
              <div className="rounded-full bg-primary/10 p-3">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Study Resources</h3>
              <p className="text-muted-foreground">
                Access curated study materials, PDFs, and video tutorials to help you prepare for exams.
              </p>
              {user ? <Link to="/resources">
                  <Button variant="outline">View Resources</Button>
                </Link> : <Link to="/login">
                  <Button variant="outline">Sign In to Access</Button>
                </Link>}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-white to-blue-50 dark:from-background dark:to-gray-900">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                What Students Say
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground">
                Hear from CA students who have boosted their productivity with StudyHub.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
            <div className="flex flex-col justify-between space-y-4 rounded-lg border bg-background p-6">
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  "The Pomodoro timer and subject tracking helped me study more efficiently for my CA Final exams."
                </p>
              </div>
              <div>
                <p className="font-medium">Arjun P.</p>
                <p className="text-sm text-muted-foreground">CA Intermediate</p>
              </div>
            </div>
            <div className="flex flex-col justify-between space-y-4 rounded-lg border bg-background p-6">
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  "The study rooms feature allowed me to connect with peers and solve problems together."
                </p>
              </div>
              <div>
                <p className="font-medium">Priya S.</p>
                <p className="text-sm text-muted-foreground">CA Final</p>
              </div>
            </div>
            <div className="flex flex-col justify-between space-y-4 rounded-lg border bg-background p-6">
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  "I love how the planner helps me visualize my study schedule across all subjects."
                </p>
              </div>
              <div>
                <p className="font-medium">Rahul M.</p>
                <p className="text-sm text-muted-foreground">CA Foundation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Ready to Elevate Your CA Studies?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                Join thousands of CA students who are studying smarter, not harder.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              {!user ? <>
                  <Link to="/register">
                    <Button size="lg">Create Free Account</Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg">
                      Sign In
                    </Button>
                  </Link>
                </> : <Link to="/tools">
                  <Button size="lg">Access All Tools</Button>
                </Link>}
            </div>
          </div>
        </div>
      </section>
    </div>;
};
export default Index;