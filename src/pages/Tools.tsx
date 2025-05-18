
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
      color: "bg-blue-100 dark:bg-blue-900",
      iconColor: "text-blue-500"
    },
    {
      title: "Study Planner",
      description: "Plan and organize your study schedule",
      icon: Calendar,
      path: "/planner",
      color: "bg-green-100 dark:bg-green-900",
      iconColor: "text-green-500"
    },
    {
      title: "Study Rooms",
      description: "Join virtual study rooms with other students",
      icon: Users,
      path: "/rooms",
      color: "bg-purple-100 dark:bg-purple-900",
      iconColor: "text-purple-500"
    },
    {
      title: "Study Resources",
      description: "Access helpful resources for your CA preparation",
      icon: BookOpen,
      path: "/resources",
      color: "bg-amber-100 dark:bg-amber-900",
      iconColor: "text-amber-500"
    }
  ];

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Study Tools</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tools.map((tool) => (
          <Link to={tool.path} key={tool.path} className="no-underline">
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader className={`${tool.color} rounded-t-lg`}>
                <div className="flex justify-center p-4">
                  <tool.icon size={48} className={tool.iconColor} />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <CardTitle className="text-xl mb-2 text-center">{tool.title}</CardTitle>
                <CardDescription className="text-center">{tool.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Tools;
