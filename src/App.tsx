import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, ThumbsUp, Clock, MessageSquare, TrendingUp, X, Tag, Filter, CornerDownRight } from 'lucide-react';

const TOPICS = [
  'Tecnología',
  'Política',
  'Deportes',
  'Cultura',
  'Ciencia',
  'Educación',
  'Entretenimiento',
  'Salud',
  'Economía',
  'Medio Ambiente'
];

interface Comment {
  id: string;
  content: string;
  username: string;
  timestamp: number;
  likes: number;
  replies: Comment[];
}

interface Post {
  id: string;
  content: string;
  timestamp: number;
  likes: number;
  username: string;
  comments: Comment[];
  topics: string[];
}

function getTopicColor(topic: string): string {
  const colors: { [key: string]: string } = {
    'Tecnología': 'bg-blue-100 text-blue-700',
    'Política': 'bg-red-100 text-red-700',
    'Deportes': 'bg-green-100 text-green-700',
    'Cultura': 'bg-purple-100 text-purple-700',
    'Ciencia': 'bg-indigo-100 text-indigo-700',
    'Educación': 'bg-yellow-100 text-yellow-700',
    'Entretenimiento': 'bg-pink-100 text-pink-700',
    'Salud': 'bg-teal-100 text-teal-700',
    'Economía': 'bg-orange-100 text-orange-700',
    'Medio Ambiente': 'bg-emerald-100 text-emerald-700'
  };
  return colors[topic] || 'bg-gray-100 text-gray-700';
}

function App() {
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('forumPosts');
    const parsedPosts = saved ? JSON.parse(saved) : [];
    return parsedPosts.map((post: any) => ({
      ...post,
      comments: post.comments || [],
      topics: post.topics || []
    }));
  });
  const [newPost, setNewPost] = useState('');
  const [postUsername, setPostUsername] = useState('');
  const [commentUsername, setCommentUsername] = useState('');
  const [newComments, setNewComments] = useState<{ [key: string]: { content: string; username: string } }>({});
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [activeCommentForm, setActiveCommentForm] = useState<string | null>(null);
  const [activeReplyForm, setActiveReplyForm] = useState<{ postId: string, commentId: string } | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // Sort posts by popularity (likes + comments)
  const sortedPosts = [...posts].sort((a, b) => {
    const popularityA = a.likes + a.comments.length;
    const popularityB = b.likes + b.comments.length;
    return popularityB - popularityA;
  });

  // Filter posts by selected topics
  const filteredPosts = sortedPosts.filter(post =>
    selectedFilters.length === 0 ||
    post.topics.some(topic => selectedFilters.includes(topic))
  );

  useEffect(() => {
    localStorage.setItem('forumPosts', JSON.stringify(posts));
  }, [posts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !postUsername.trim() || selectedTopics.length === 0) return;

    const post: Post = {
      id: Date.now().toString(),
      content: newPost.trim(),
      timestamp: Date.now(),
      likes: 0,
      username: postUsername.trim(),
      comments: [],
      topics: selectedTopics
    };

    setPosts(prev => [post, ...prev]);
    setNewPost('');
    setSelectedTopics([]);
    setShowNewPostForm(false);
  };

  const handleTopicSelection = (topic: string) => {
    setSelectedTopics(prev => {
      if (prev.includes(topic)) {
        return prev.filter(t => t !== topic);
      } else {
        return [...prev, topic];
      }
    });
  };

  const handleFilterChange = (topic: string) => {
    setSelectedFilters(prev => {
      if (prev.includes(topic)) {
        return prev.filter(t => t !== topic);
      } else {
        return [...prev, topic];
      }
    });
  };

  const handleLike = (postId: string) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  const handleComment = (postId: string, parentCommentId?: string) => {
    const commentData = newComments[postId];
    if (!commentData?.content.trim() || !commentData?.username.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      content: commentData.content.trim(),
      username: commentData.username.trim(),
      timestamp: Date.now(),
      likes: 0,
      replies: [],
    };

    setPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          if (parentCommentId) {
            return {
              ...post,
              comments: post.comments.map(comment =>
                comment.id === parentCommentId
                  ? { ...comment, replies: [...comment.replies, newComment] }
                  : comment
              ),
            };
          } else {
            return { ...post, comments: [...post.comments, newComment] };
          }
        }
        return post;
      })
    );

    setNewComments(prev => ({ ...prev, [postId]: { content: '', username: '' } }));
    setActiveCommentForm(null);
    setActiveReplyForm(null);
  };

  const handleCommentLike = (postId: string, commentId: string, parentCommentId?: string) => {
    setPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          if (parentCommentId) {
            return {
              ...post,
              comments: post.comments.map(comment =>
                comment.id === parentCommentId
                  ? {
                      ...comment,
                      replies: comment.replies.map(reply =>
                        reply.id === commentId
                          ? { ...reply, likes: reply.likes + 1 }
                          : reply
                      ),
                    }
                  : comment
              ),
            };
          } else {
            return {
              ...post,
              comments: post.comments.map(comment =>
                comment.id === commentId
                  ? { ...comment, likes: comment.likes + 1 }
                  : comment
              ),
            };
          }
        }
        return post;
      })
    );
  };

  const toggleCommentForm = (postId: string) => {
    setActiveCommentForm(activeCommentForm === postId ? null : postId);
    setActiveReplyForm(null);
  };

  const toggleReplyForm = (postId: string, commentId: string) => {
    setActiveReplyForm(
      activeReplyForm?.postId === postId && activeReplyForm?.commentId === commentId
        ? null
        : { postId, commentId }
    );
    setActiveCommentForm(null);
  };

  const renderComments = (comments: Comment[], postId: string, parentCommentId?: string) => (
    <div className="space-y-3">
      {comments.map(comment => (
        <div key={comment.id} className={`bg-gray-50 rounded-lg p-3 ${parentCommentId ? 'ml-6' : ''}`}>
          <div className="flex justify-between items-start mb-2">
            <span className="font-medium">{comment.username}</span>
            <span className="text-xs text-gray-500">
              {new Date(comment.timestamp).toLocaleString()}
            </span>
          </div>
          <p className="text-gray-700 mb-2">{comment.content}</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleCommentLike(postId, comment.id, parentCommentId)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{comment.likes}</span>
            </button>
            <button
              onClick={() => toggleReplyForm(postId, comment.id)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600"
            >
              <CornerDownRight className="w-4 h-4" />
              <span>Responder</span>
            </button>
          </div>
          {activeReplyForm?.postId === postId && activeReplyForm?.commentId === comment.id && (
            <div className="mt-2 space-y-2">
              <input
                type="text"
                placeholder="Tu nombre"
                value={newComments[postId]?.username || ''}
                onChange={(e) =>
                  setNewComments(prev => ({
                    ...prev,
                    [postId]: { ...prev[postId], username: e.target.value },
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Escribe tu respuesta..."
                value={newComments[postId]?.content || ''}
                onChange={(e) =>
                  setNewComments(prev => ({
                    ...prev,
                    [postId]: { ...prev[postId], content: e.target.value },
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => handleComment(postId, comment.id)}
                  className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Responder
                </button>
              </div>
            </div>
          )}
          {comment.replies && comment.replies.length > 0 && renderComments(comment.replies, postId, comment.id)}
        </div>
      ))}
    </div>
  );

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
          <div className="flex items-center gap-2 text-gray-600 mb-4">
            <TrendingUp className="w-5 h-5" />
            <p>Debates más populares ordenados por likes y comentarios</p>
          </div>

          {/* Filtro de temas */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">Filtrar por temas</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {TOPICS.map(topic => (
                <button
                  key={topic}
                  onClick={() => handleFilterChange(topic)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedFilters.includes(topic)
                      ? getTopicColor(topic)
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Tag className="w-3 h-3" />
                  <span>{topic}</span>
                </button>
              ))}
            </div>
            {selectedFilters.length > 0 && (
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => setSelectedFilters([])}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Modal para nuevo debate */}
        {showNewPostForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Crear nuevo debate</h2>
                <button
                  onClick={() => {
                    setShowNewPostForm(false);
                    setSelectedTopics([]);
                  }}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temas del debate
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                    {TOPICS.map(topic => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => handleTopicSelection(topic)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                          selectedTopics.includes(topic)
                            ? getTopicColor(topic)
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Tag className="w-3 h-3" />
                        <span>{topic}</span>
                      </button>
                    ))}
                  </div>
                  {selectedTopics.length === 0 && (
                    <p className="text-sm text-red-500">Selecciona al menos un tema</p>
                  )}
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
                    disabled={selectedTopics.length === 0}
                  >
                    <Send className="w-4 h-4" />
                    Publicar debate
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Mensaje cuando no hay resultados */}
        {filteredPosts.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">No hay debates que coincidan con los temas seleccionados.</p>
          </div>
        )}

        <div className="space-y-4">
          {filteredPosts.map(post => (
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

              {/* Temas del post */}
              <div className="flex flex-wrap gap-2 mb-4">
                {post.topics.map(topic => (
                  <span
                    key={topic}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getTopicColor(topic)}`}
                  >
                    <Tag className="w-3 h-3" />
                    {topic}
                  </span>
                ))}
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
                            value={newComments[post.id]?.username || ''}
                            onChange={(e) => setNewComments(prev => ({
                              ...prev,
                              [post.id]: { ...prev[post.id], username: e.target.value },
                            }))}
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
                            value={newComments[post.id]?.content || ''}
                            onChange={(e) => setNewComments(prev => ({
                              ...prev,
                              [post.id]: { ...prev[post.id], content: e.target.value },
                            }))}
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

                {renderComments(post.comments, post.id)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;

