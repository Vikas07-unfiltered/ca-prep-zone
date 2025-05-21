import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { Clock, Calendar, Users, BookOpen } from 'lucide-react';
import Timer from "./Timer";
import Planner from "./Planner";
import StudyRooms from "./StudyRooms";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Tools = () => {
  const location = useLocation();
  const isToolsHome = location.pathname === "/tools";

  const [selectedLevel, setSelectedLevel] = useState("All");

  const tools = [
    {
      title: "Study Timer",
      description: "Focus on your studies with our Pomodoro timer",
      icon: Clock,
      path: "/tools/timer",
      color: "bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700",
      iconColor: "text-blue-500"
    },
    {
      title: "Study Planner",
      description: "Plan and organize your study schedule",
      icon: Calendar,
      path: "/tools/planner",
      color: "bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700",
      iconColor: "text-green-500"
    },
    {
      title: "Study Rooms",
      description: "Join virtual study rooms with other students",
      icon: Users,
      path: "/tools/rooms",
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

  const filteredTools = tools;

  if (!isToolsHome) {
    return (
      <Routes>
        <Route path="/timer" element={<Timer />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/rooms" element={<StudyRooms />} />
      </Routes>
    );
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <h1 className="text-3xl font-bold mb-8">Tools</h1>
        </ScrollReveal>
        <p className="text-muted-foreground mb-8">All the tools you need for effective CA exam preparation</p>
        
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTools.map((tool, i) => (
            <ScrollReveal key={tool.path} delay={0.1 + i * 0.05}>
              <Link to={tool.path} className="no-underline group">
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
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tools;