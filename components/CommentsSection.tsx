'use client';

import React, { useState } from 'react';
import { Send, MessageSquare, User, Calendar } from 'lucide-react';

interface Comment {
  id: string;
  authorName: string;
  content: string;
  createdAt: Date | string;
}

interface CommentsSectionProps {
  postId: string;
  initialComments: Comment[];
}

export default function CommentsSection({ postId, initialComments }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) return;

    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, authorName, content }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setComments((prev) => [data.comment, ...prev]);
        setAuthorName('');
        setContent('');
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || 'Failed to post comment.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: Date | string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="mt-12 border-t border-[rgba(255,255,255,0.05)] pt-10">
      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5 text-indigo-400" />
        <span>Discussion ({comments.length})</span>
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-10 space-y-4 bg-[rgba(17,12,28,0.2)] border border-[rgba(99,102,241,0.1)] rounded-2xl p-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Join the discussion</h4>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="authorName" className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">Name</label>
            <div className="relative rounded-xl border border-[rgba(99,102,241,0.15)] bg-indigo-950/10 p-1 flex items-center">
              <User className="h-4 w-4 text-gray-500 ml-2" />
              <input
                type="text"
                id="authorName"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full bg-transparent px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="commentContent" className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">Comment</label>
            <div className="relative rounded-xl border border-[rgba(99,102,241,0.15)] bg-indigo-950/10 p-2">
              <textarea
                id="commentContent"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What are your thoughts?"
                rows={4}
                required
                className="w-full bg-transparent p-1 text-xs text-white placeholder-gray-500 focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}
        {success && <p className="text-xs text-emerald-400 font-medium">Comment posted successfully!</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:opacity-50 text-white text-xs font-semibold tracking-wide shadow-md shadow-indigo-600/10 transition-all duration-300"
          >
            {isSubmitting ? <span>Posting...</span> : <span>Post Comment</span>}
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>

      {/* Comment List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-xs text-gray-500 italic">No comments yet. Be the first to start the conversation!</p>
        ) : (
          comments.map((comment) => (
            <div 
              key={comment.id} 
              className="p-5 rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)] flex gap-4 text-left items-start animate-fade-in"
            >
              <div className="h-8 w-8 rounded-full bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {comment.authorName.charAt(0)}
              </div>
              <div className="flex-grow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="text-xs font-bold text-gray-200">{comment.authorName}</span>
                  <span className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(comment.createdAt)}</span>
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
