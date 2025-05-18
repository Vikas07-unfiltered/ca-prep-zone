
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Clock, Calendar, Users, BookOpen } from 'lucide-react';

const Tools = () => {
  const tools = [
    {
      title: "Study Timer",
      description: "Focus on your studies with our Pomodoro timer",
      icon: Clock,
      path: "/timer",
      color: "bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700",
      iconColor: "text-blue-500"
    },
    {
      title: "Study Planner",
      description: "Plan and organize your study schedule",
      icon: Calendar,
      path: "/planner",
      color: "bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700",
      iconColor: "text-green-500"
    },
    {
      title: "Study Rooms",
      description: "Join virtual study rooms with other students",
      icon: Users,
      path: "/rooms",
      color: "bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700",
      iconColor: "text-purple-500"
    },
    {
      title: "Study Resources",
      description: "Access helpful resources for your CA preparation",
      icon: BookOpen,
      path: "/resources",
      color: "bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700",
      iconColor: "text-amber-500"
    }
  ];

  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold mb-2">Study Tools</h1>
        <p className="text-muted-foreground mb-8">All the tools you need for effective CA exam preparation</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool) => (
            <Link to={tool.path} key={tool.path} className="no-underline group">
              <Card className="h-full border border-border/40 transition-all duration-200 hover:border-border hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-gray-100 dark:bg-gray-700">
                      <tool.icon size={20} className={tool.iconColor} />
                    </div>
                    <CardTitle className="text-xl">{tool.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{tool.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tools;
