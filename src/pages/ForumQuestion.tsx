import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function ForumQuestion() {
  const { id } = useParams();
  const { user } = useAuth();
  const [question, setQuestion] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upvoting, setUpvoting] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestion();
    // eslint-disable-next-line
  }, [id]);

  async function fetchQuestion() {
    setLoading(true);
    const { data: q, error: qErr } = await supabase
      .from('forum_questions')
      .select('*')
      .eq('id', id)
      .single();
    if (qErr) {
      setLoading(false);
      setQuestion(null);
      return;
    }
    setQuestion(q);
    // Fetch answers
    const { data: a } = await supabase
      .from('forum_answers')
      .select('*')
      .eq('question_id', id)
      .order('created_at', { ascending: true });
    setAnswers(a || []);
    setLoading(false);
  }

  async function handleAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (!answerText.trim()) {
      setError('Answer cannot be empty.');
      return;
    }
    if (!user) {
      setError('You must be signed in to answer.');
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.from('forum_answers').insert([
      { question_id: id, answer: answerText, user_id: user.id }
    ]);
    setSubmitting(false);
    if (error) {
      setError('Failed to post answer.');
      return;
    }
    setAnswerText('');
    fetchQuestion();
  }

  async function handleUpvoteQuestion() {
    if (!user) {
      setInfo('You must be signed in to upvote.');
      return;
    }
    setUpvoting(true);
    const user_id = user.id;
    // Prevent duplicate upvotes by checking if already upvoted
    const { count, error: checkError } = await supabase
      .from('forum_upvotes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id)
      .eq('question_id', id);
    if (!checkError && count === 0) {
      await supabase.from('forum_upvotes').insert([
        { user_id, question_id: id }
      ]);
    }
    fetchQuestion();
    setUpvoting(false);
  }

  return (
    <div className="container py-10 max-w-2xl mx-auto">
      {loading ? (
        <div>Loading...</div>
      ) : !question ? (
        <div>Question not found.</div>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">{question.title}</h2>
            <div className="text-muted-foreground mb-2">{question.description}</div>
            <div className="flex gap-4 items-center mb-2">
              <Button onClick={handleUpvoteQuestion} disabled={upvoting} variant="outline">
                Upvote
              </Button>
              {/* Upvote count */}
              <span className="text-sm">{/* TODO: Show upvote count */}</span>
              {info && <span className="text-xs text-blue-600 ml-3">{info}</span>}
            </div>
            <div className="text-xs text-muted-foreground">Asked on {new Date(question.created_at).toLocaleString()}</div>
          </div>
          <div className="mb-8">
            <h3 className="font-semibold mb-2">Answers</h3>
            {answers.length === 0 ? (
              <div>No answers yet.</div>
            ) : (
              <div className="space-y-4">
                {answers.map(a => (
                  <div key={a.id} className="border rounded p-3">
                    <div>{a.answer}</div>
                    <div className="text-xs text-muted-foreground mt-1">Answered on {new Date(a.created_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <form onSubmit={handleAnswer} className="space-y-2">
            <Textarea
              placeholder="Write your answer..."
              value={answerText}
              onChange={e => setAnswerText(e.target.value)}
              required
            />
            {error && <div className="text-red-500 text-sm pb-2">{error}</div>}
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Posting...' : 'Post Answer'}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
