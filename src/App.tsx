import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, ThumbsUp, Clock, MessageSquare, TrendingUp, X } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  username: string;
  timestamp: number;
}

interface Post {
  id: string;
  content: string;
  timestamp: number;
  likes: number;
  username: string;
  comments: Comment[];
}

function App() {
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('forumPosts');
    const parsedPosts = saved ? JSON.parse(saved) : [];
    return parsedPosts.map((post: any) => ({
      ...post,
      comments: post.comments || [],
    }));
  });
  const [newPost, setNewPost] = useState('');
  const [postUsername, setPostUsername] = useState('');
  const [commentUsername, setCommentUsername] = useState('');
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({});
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [activeCommentForm, setActiveCommentForm] = useState<string | null>(null);

  // Sort posts by popularity (likes + comments)
  const sortedPosts = [...posts].sort((a, b) => {
    const popularityA = a.likes + a.comments.length;
    const popularityB = b.likes + b.comments.length;
    return popularityB - popularityA;
  });

  useEffect(() => {
    localStorage.setItem('forumPosts', JSON.stringify(posts));
  }, [posts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !postUsername.trim()) return;

    const post: Post = {
      id: Date.now().toString(),
      content: newPost.trim(),
      timestamp: Date.now(),
      likes: 0,
      username: postUsername.trim(),
      comments: [],
    };

    setPosts(prev => [post, ...prev]);
    setNewPost('');
    setShowNewPostForm(false);
  };

  const handleLike = (postId: string) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  const handleComment = (postId: string) => {
    const commentContent = newComments[postId];
    if (!commentContent?.trim() || !commentUsername.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      content: commentContent.trim(),
      username: commentUsername.trim(),
      timestamp: Date.now(),
    };

    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      )
    );

    setNewComments(prev => ({ ...prev, [postId]: '' }));
    setActiveCommentForm(null);
  };

  const toggleCommentForm = (postId: string) => {
    setActiveCommentForm(activeCommentForm === postId ? null : postId);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-4">
        <header className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">Foro de Debate</h1>
            </div>
            <button
              onClick={() => setShowNewPostForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Nuevo Debate
            </button>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <TrendingUp className="w-5 h-5" />
            <p>Debates más populares ordenados por likes y comentarios</p>
          </div>
        </header>

        {/* Modal para nuevo debate */}
        {showNewPostForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Crear nuevo debate</h2>
                <button
                  onClick={() => setShowNewPostForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Tu nombre
                  </label>
                  <input
                    id="username"
                    type="text"
                    placeholder="Escribe tu nombre"
                    value={postUsername}
                    onChange={(e) => setPostUsername(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="post-content" className="block text-sm font-medium text-gray-700 mb-1">
                    Tema del debate
                  </label>
                  <textarea
                    id="post-content"
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="¿Qué tema quieres debatir?"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Publicar debate
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {sortedPosts.map(post => (
            <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{post.username}</h3>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(post.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-600 font-medium">{post.likes}</span>
                  </button>
                  <button
                    onClick={() => toggleCommentForm(post.id)}
                    className="flex items-center gap-1 bg-purple-50 px-3 py-1 rounded-full hover:bg-purple-100 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                    <span className="text-purple-600 font-medium">{post.comments.length}</span>
                  </button>
                </div>
              </div>
              <p className="text-gray-700 mb-4">{post.content}</p>

              <div className="border-t pt-4">
                {/* Modal para comentarios */}
                {activeCommentForm === post.id && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Añadir comentario</h2>
                        <button
                          onClick={() => setActiveCommentForm(null)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="comment-username" className="block text-sm font-medium text-gray-700 mb-1">
                            Tu nombre
                          </label>
                          <input
                            id="comment-username"
                            type="text"
                            placeholder="Escribe tu nombre"
                            value={commentUsername}
                            onChange={(e) => setCommentUsername(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="comment-content" className="block text-sm font-medium text-gray-700 mb-1">
                            Tu comentario
                          </label>
                          <input
                            id="comment-content"
                            type="text"
                            placeholder="Escribe tu comentario..."
                            value={newComments[post.id] || ''}
                            onChange={(e) =>
                              setNewComments(prev => ({
                                ...prev,
                                [post.id]: e.target.value,
                              }))
                            }
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleComment(post.id)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                          >
                            <Send className="w-4 h-4" />
                            Publicar comentario
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {post.comments.length > 0 && (
                  <div className="space-y-3">
                    {post.comments.map(comment => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">{comment.username}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;