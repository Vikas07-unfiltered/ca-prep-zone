import React from "react";
import { Link } from "react-router-dom";

const Preparation = () => {
  return (
    <div className="container py-8 md:py-12">
      <h1 className="text-3xl font-bold mb-6">Preparation</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/resources" className="block p-6 border border-border/40 rounded-lg shadow hover:shadow-md hover:border-border transition-all">
          <h2 className="text-xl font-semibold mb-2">Resources</h2>
          <p className="text-muted-foreground">Access helpful resources for your CA preparation.</p>
        </Link>
        <Link to="/mcq" className="block p-6 border border-border/40 rounded-lg shadow hover:shadow-md hover:border-border transition-all">
          <h2 className="text-xl font-semibold mb-2">MCQ</h2>
          <p className="text-muted-foreground">Practice Multiple Choice Questions for your CA exams.</p>
        </Link>
        <Link to="/test" className="block p-6 border border-border/40 rounded-lg shadow hover:shadow-md hover:border-border transition-all">
          <h2 className="text-xl font-semibold mb-2">Test</h2>
          <p className="text-muted-foreground">Take full-length or topic-wise tests to assess your readiness.</p>
        </Link>
      </div>
    </div>
  );
};

export default Preparation;
