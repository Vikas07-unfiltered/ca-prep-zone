import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface Question {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  upvotes: number;
  answers: number;
}

export default function Forum() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [askOpen, setAskOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    setLoading(true);
    // Get questions, upvote count, and answer count
    const { data: questionsData, error } = await supabase
      .from('forum_questions')
      .select('id, title, description, created_at, updated_at');
    if (error) {
      setLoading(false);
      return;
    }
    // For each question, get upvote and answer count
    const questionsWithCounts = await Promise.all(
      (questionsData || []).map(async (q: any) => {
        const { count: upvotes } = await supabase
          .from('forum_upvotes')
          .select('*', { count: 'exact', head: true })
          .eq('question_id', q.id);
        const { count: answers } = await supabase
          .from('forum_answers')
          .select('*', { count: 'exact', head: true })
          .eq('question_id', q.id);
        return { ...q, upvotes: upvotes || 0, answers: answers || 0 };
      })
    );
    setQuestions(questionsWithCounts);
    setLoading(false);
  }

  async function handleAskQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.from('forum_questions').insert([
      { title, description }
    ]);
    setSubmitting(false);
    if (error) {
      setError('Failed to post question.');
      return;
    }
    setTitle('');
    setDescription('');
    setAskOpen(false);
    fetchQuestions();
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Discussion Forum</h1>
        <Dialog open={askOpen} onOpenChange={setAskOpen}>
          <DialogTrigger asChild>
            <Button>Ask a Question</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ask a Question</DialogTitle>
              <DialogDescription>Share your question with the community.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAskQuestion} className="space-y-4">
              <Input
                placeholder="Question Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
              <Textarea
                placeholder="Describe your question (optional)"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
              {error && <div className="text-red-500 text-sm pb-2">{error}</div>}
              <DialogFooter>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Posting...' : 'Post Question'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {loading ? (
        <div>Loading questions...</div>
      ) : questions.length === 0 ? (
        <div>No questions yet. Be the first to ask!</div>
      ) : (
        <div className="space-y-4">
          {questions.map(q => (
            <div key={q.id} className="border rounded p-4 flex items-center justify-between">
              <div>
                <Link to={`/forum/${q.id}`} className="text-lg font-semibold hover:underline">{q.title}</Link>
                <div className="text-muted-foreground text-xs mt-1">{q.answers} Answers • {q.upvotes} Upvotes</div>
              </div>
              <div className="text-xs text-muted-foreground">{new Date(q.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
