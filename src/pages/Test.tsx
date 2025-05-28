import React from "react";

const Test = () => {
  return (
    <div className="relative container py-8 md:py-12 flex items-center justify-center min-h-[300px]">
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <span className="bg-yellow-400 text-yellow-900 text-lg font-bold px-8 py-4 rounded-xl shadow-lg opacity-90 border-2 border-yellow-600 animate-pulse">
          🚧 Coming Soon 🚧
        </span>
      </div>
      <div className="opacity-40 blur-sm select-none pointer-events-none">
        <h1 className="text-3xl font-bold mb-6">Test Yourself</h1>
        <p className="mb-4 text-muted-foreground">Take full-length or topic-wise tests to assess your CA exam readiness.</p>
      </div>
    </div>
  );
};

export default Test;
