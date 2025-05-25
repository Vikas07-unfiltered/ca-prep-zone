import React, { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  sender: "user" | "ai";
  text: string;
}

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "ai", text: "Hi! I'm your Study Assistant. Ask me anything about your study plan or progress!" }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: "user", text: input }]);
    // Simulate AI response (replace with real AI API call)
    setTimeout(() => {
      setMessages(msgs => [
        ...msgs,
        { sender: "ai", text: "I'm analyzing your input: '" + input + "'. (This is a demo response.)" }
      ]);
    }, 800);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Study Planner Chat</CardTitle>
      </CardHeader>
      <CardContent className="h-64 overflow-y-auto flex flex-col gap-2 bg-muted/50 p-2 rounded">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`text-sm px-3 py-2 rounded-lg max-w-[85%] ${msg.sender === "user" ? "bg-primary text-primary-foreground self-end" : "bg-card text-card-foreground self-start border"}`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter className="flex gap-2">
        <Input
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button onClick={handleSend} variant="default">Send</Button>
      </CardFooter>
    </Card>
  );
};
