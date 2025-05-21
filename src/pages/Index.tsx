import { Link } from "react-router-dom";
import { Clock, Calendar, Users, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AnimatedContainer, AnimatedList } from "@/components/ui/animated-container";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Doodle } from "@/components/ui/Doodle";
import { ScrollReveal } from "@/components/ScrollReveal";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="relative">
      {/* Hero Section */}
      <ScrollReveal>
        <section className="py-20 md:py-24 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-background">
          <div className="container px-4 md:px-6">
            <AnimatedContainer className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Master Your CA Studies with Unfiltered CA
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Your comprehensive platform for CA exam preparation
                </p>
              </div>
              <AnimatedContainer delay={0.2} className="flex flex-col gap-2 min-[400px]:flex-row">
                {!user ? (
                  <>
                    <Link to="/register">
                      <AnimatedButton size="lg" hoverScale={1.08}>Get Started</AnimatedButton>
                    </Link>
                    <Link to="/login">
                      <AnimatedButton variant="outline" size="lg" hoverScale={1.05}>
                        Sign In
                      </AnimatedButton>
                    </Link>
                  </>
                ) : (
                  <Link to="/tools">
                    <AnimatedButton size="lg" hoverScale={1.08}>Access Study Tools</AnimatedButton>
                  </Link>
                )}
              </AnimatedContainer>
            </AnimatedContainer>
          </div>
        </section>
      </ScrollReveal>

      {/* Features Section */}
      <ScrollReveal delay={0.1}>
        <section className="py-16 md:py-20">
          <div className="container px-4 md:px-6">
            <ScrollReveal>
              <AnimatedContainer className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                    Study Tools Designed for CA Students
                  </h2>
                  <p className="mx-auto max-w-[700px] text-muted-foreground">
                    Everything you need to excel in your chartered accountancy studies, all in one place.
                  </p>
                </div>
              </AnimatedContainer>
            </ScrollReveal>
            
            <AnimatedList
              className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:gap-12"
              delay={0.2}
              staggerDelay={0.1}
            >
              <ScrollReveal delay={0.2}>
                <div className="flex flex-col items-start space-y-4 rounded-lg border bg-background p-6">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Pomodoro Timer</h3>
                  <p className="text-muted-foreground">
                    Stay focused with customizable study intervals. Track subjects and analyze your study patterns.
                  </p>
                  {user ? (
                    <Link to="/timer">
                      <AnimatedButton variant="outline" hoverScale={1.05}>Try Timer</AnimatedButton>
                    </Link>
                  ) : (
                    <Link to="/login">
                      <AnimatedButton variant="outline" hoverScale={1.05}>Sign In to Access</AnimatedButton>
                    </Link>
                  )}
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.3}>
                <div className="flex flex-col items-start space-y-4 rounded-lg border bg-background p-6">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Study Planner</h3>
                  <p className="text-muted-foreground">
                    Plan your study schedule, set goals, and track your progress across all subjects.
                  </p>
                  {user ? (
                    <Link to="/planner">
                      <AnimatedButton variant="outline" hoverScale={1.05}>Open Planner</AnimatedButton>
                    </Link>
                  ) : (
                    <Link to="/login">
                      <AnimatedButton variant="outline" hoverScale={1.05}>Sign In to Access</AnimatedButton>
                    </Link>
                  )}
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.4}>
                <div className="flex flex-col items-start space-y-4 rounded-lg border bg-background p-6">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Study Groups</h3>
                  <p className="text-muted-foreground">
                    Connect with fellow CA students, share resources, and study together.
                  </p>
                  {user ? (
                    <Link to="/groups">
                      <AnimatedButton variant="outline" hoverScale={1.05}>Join Groups</AnimatedButton>
                    </Link>
                  ) : (
                    <Link to="/login">
                      <AnimatedButton variant="outline" hoverScale={1.05}>Sign In to Access</AnimatedButton>
                    </Link>
                  )}
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.5}>
                <div className="flex flex-col items-start space-y-4 rounded-lg border bg-background p-6">
                  <div className="rounded-full bg-primary/10 p-3">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Study Resources</h3>
                  <p className="text-muted-foreground">
                    Access curated study materials, PDFs, and video tutorials to help you prepare for exams.
                  </p>
                  {user ? (
                    <Link to="/resources">
                      <AnimatedButton variant="outline" hoverScale={1.05}>View Resources</AnimatedButton>
                    </Link>
                  ) : (
                    <Link to="/login">
                      <AnimatedButton variant="outline" hoverScale={1.05}>Sign In to Access</AnimatedButton>
                    </Link>
                  )}
                </div>
              </ScrollReveal>
            </AnimatedList>
          </div>
        </section>
      </ScrollReveal>

      {/* Testimonials Section */}
      <ScrollReveal delay={0.2}>
        <section className="py-16 md:py-20 bg-muted/50">
          <div className="container px-4 md:px-6">
            <ScrollReveal>
              <AnimatedContainer className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                    What Our Students Say
                  </h2>
                  <p className="mx-auto max-w-[700px] text-muted-foreground">
                    Join thousands of successful CA students who have transformed their study experience.
                  </p>
                </div>
              </AnimatedContainer>
            </ScrollReveal>

            <AnimatedList
              className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3"
              delay={0.2}
              staggerDelay={0.1}
            >
              <ScrollReveal delay={0.2}>
                <div className="flex flex-col justify-between space-y-4 rounded-lg border bg-background p-6">
                  <div className="space-y-2">
                    <p className="text-muted-foreground">
                      "The Pomodoro timer has completely changed how I study. I'm more focused and productive than ever."
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Priya S.</p>
                    <p className="text-sm text-muted-foreground">CA Intermediate</p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.3}>
                <div className="flex flex-col justify-between space-y-4 rounded-lg border bg-background p-6">
                  <div className="space-y-2">
                    <p className="text-muted-foreground">
                      "The study planner helps me stay organized and ensures I cover all subjects effectively."
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Rahul M.</p>
                    <p className="text-sm text-muted-foreground">CA Foundation</p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.4}>
                <div className="flex flex-col justify-between space-y-4 rounded-lg border bg-background p-6">
                  <div className="space-y-2">
                    <p className="text-muted-foreground">
                      "The study groups feature helped me connect with other students and share valuable resources."
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Ananya K.</p>
                    <p className="text-sm text-muted-foreground">CA Final</p>
                  </div>
                </div>
              </ScrollReveal>
            </AnimatedList>
          </div>
        </section>
      </ScrollReveal>

      {/* CTA Section */}
      <section className="py-16 md:py-20">
        <div className="container px-4 md:px-6">
          <AnimatedContainer className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Ready to Elevate Your CA Studies?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                Join thousands of CA students who are studying smarter, not harder.
              </p>
            </div>
            <AnimatedContainer delay={0.2} className="flex flex-col gap-2 min-[400px]:flex-row">
              {!user ? (
                <>
                  <Link to="/register">
                    <AnimatedButton size="lg" hoverScale={1.08}>Create Free Account</AnimatedButton>
                  </Link>
                  <Link to="/login">
                    <AnimatedButton variant="outline" size="lg" hoverScale={1.05}>
                      Sign In
                    </AnimatedButton>
                  </Link>
                </>
              ) : (
                <Link to="/tools">
                  <AnimatedButton size="lg" hoverScale={1.08}>Access All Tools</AnimatedButton>
                </Link>
              )}
            </AnimatedContainer>
          </AnimatedContainer>
        </div>
      </section>

      {/* Doodle in bottom right */}
      <div className="fixed bottom-4 right-4 z-0 opacity-60 pointer-events-none select-none">
        <Doodle name="finance" className="w-40 h-40" />
      </div>
    </div>
  );
};

export default Index;