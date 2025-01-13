import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, ChevronUp, ChevronDown, Clock, MessageSquare, TrendingUp, X, Tag, Filter, CornerDownRight, ArrowLeft, ImageIcon, Search, Eye, Gift } from 'lucide-react';

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
  score: number;
  replies: Comment[];
}

interface Post {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  score: number;
  username: string;
  comments: Comment[];
  topics: string[];
  image?: string;
}

function getTopicColor(topic: string): string {
  const colors: { [key: string]: string } = {
    'Tecnología': 'bg-blue-100 text-blue-800',
    'Política': 'bg-orange-100 text-orange-800',
    'Deportes': 'bg-green-100 text-green-800',
    'Cultura': 'bg-purple-100 text-purple-800',
    'Ciencia': 'bg-teal-100 text-teal-800',
    'Educación': 'bg-yellow-100 text-yellow-800',
    'Entretenimiento': 'bg-pink-100 text-pink-800',
    'Salud': 'bg-red-100 text-red-800',
    'Economía': 'bg-indigo-100 text-indigo-800',
    'Medio Ambiente': 'bg-emerald-100 text-emerald-800'
  };
  return colors[topic] || 'bg-gray-100 text-gray-800';
}

function App() {
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('forumPosts');
    const parsedPosts = saved ? JSON.parse(saved) : [];
    return parsedPosts.map((post: any) => ({
      ...post,
      comments: post.comments || [],
      topics: post.topics || [],
      score: post.score || 0,
      image: post.image || undefined
    }));
  });
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newPost, setNewPost] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [postUsername, setPostUsername] = useState('');
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [newComments, setNewComments] = useState<{ [key: string]: { content: string; username: string } }>({});
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [activeCommentForm, setActiveCommentForm] = useState<string | null>(null);
  const [activeReplyForm, setActiveReplyForm] = useState<{ postId: string, commentId: string } | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem('forumPosts', JSON.stringify(posts));
  }, [posts]);

  const sortedPosts = [...posts].sort((a, b) => b.score - a.score);

  const filteredPosts = sortedPosts.filter(post =>
    selectedFilters.length === 0 ||
    post.topics.some(topic => selectedFilters.includes(topic))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !newPostTitle.trim() || !postUsername.trim() || selectedTopics.length === 0) return;

    let imageUrl = undefined;
    if (newPostImage) {
      imageUrl = URL.createObjectURL(newPostImage);
    }

    const post: Post = {
      id: Date.now().toString(),
      title: newPostTitle.trim(),
      content: newPost.trim(),
      timestamp: Date.now(),
      score: 0,
      username: postUsername.trim(),
      comments: [],
      topics: selectedTopics,
      image: imageUrl
    };

    setPosts(prev => [post, ...prev]);
    setNewPost('');
    setNewPostTitle('');
    setPostUsername('');
    setSelectedTopics([]);
    setNewPostImage(null);
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

  const handleVote = (postId: string, value: number) => {
    setPosts(prev => {
      const updatedPosts = prev.map(post =>
        post.id === postId ? { ...post, score: post.score + value } : post
      );
      
      if (selectedPost && selectedPost.id === postId) {
        const updatedPost = updatedPosts.find(p => p.id === postId);
        if (updatedPost) {
          setSelectedPost(updatedPost);
        }
      }

      return updatedPosts;
    });
  };

  const handleComment = (postId: string, parentCommentId?: string) => {
    const commentData = newComments[postId];
    if (!commentData?.content.trim() || !commentData?.username.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      content: commentData.content.trim(),
      username: commentData.username.trim(),
      timestamp: Date.now(),
      score: 0,
      replies: []
    };

    setPosts(prev => {
      const updatedPosts = prev.map(post => {
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
      });

      if (selectedPost && selectedPost.id === postId) {
        const updatedPost = updatedPosts.find(p => p.id === postId);
        if (updatedPost) {
          setSelectedPost(updatedPost);
        }
      }

      return updatedPosts;
    });

    setNewComments(prev => ({ ...prev, [postId]: { content: '', username: '' } }));
    setActiveCommentForm(null);
    setActiveReplyForm(null);
  };

  const handleCommentVote = (postId: string, commentId: string, value: number, parentCommentId?: string) => {
    setPosts(prev => {
      const updatedPosts = prev.map(post => {
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
                          ? { ...reply, score: reply.score + value }
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
                  ? { ...comment, score: comment.score + value }
                  : comment
              ),
            };
          }
        }
        return post;
      });

      if (selectedPost && selectedPost.id === postId) {
        const updatedPost = updatedPosts.find(p => p.id === postId);
        if (updatedPost) {
          setSelectedPost(updatedPost);
        }
      }

      return updatedPosts;
    });
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
    <div className="space-y-4">
      {comments.map(comment => (
        <div key={comment.id} className={`flex ${parentCommentId ? 'ml-8' : ''}`}>
          <div className="flex flex-col items-center mr-4">
            <button onClick={() => handleCommentVote(postId, comment.id, 1, parentCommentId)} className="text-gray-500 hover:text-orange-500">
              <ChevronUp className="w-6 h-6" />
            </button>
            <span className="text-lg font-medium text-gray-700">{comment.score}</span>
            <button onClick={() => handleCommentVote(postId, comment.id, -1, parentCommentId)} className="text-gray-500 hover:text-orange-500">
              <ChevronDown className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1">
            <div className="bg-white border border-gray-200 p-4 rounded-md">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-blue-600">{comment.username}</span>
                <span className="text-xs text-gray-500">
                  {new Date(comment.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-700 mb-2">{comment.content}</p>
              <button
                onClick={() => toggleReplyForm(postId, comment.id)}
                className="text-sm text-gray-500 hover:text-blue-600"
              >
                Responder
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
                <textarea
                  placeholder="Escribe tu respuesta..."
                  value={newComments[postId]?.content || ''}
                  onChange={(e) =>
                    setNewComments(prev => ({
                      ...prev,
                      [postId]: { ...prev[postId], content: e.target.value },
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => handleComment(postId, comment.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors text-sm"
                  >
                    Responder
                  </button>
                </div>
              </div>
            )}
            {comment.replies && comment.replies.length > 0 && renderComments(comment.replies, postId, comment.id)}
          </div>
        </div>
      ))}
    </div>
  );

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white border-t-4 border-orange-500 shadow-sm mb-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mr-4"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Volver</span>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">DebateLibre</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button className="text-gray-600 hover:text-gray-800">Acerca de</button>
                <button className="text-gray-600 hover:text-gray-800">Productos</button>
                <button className="text-gray-600 hover:text-gray-800">Para equipos</button>
              </div>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start">
              <div className="flex flex-col items-center mr-4">
                <button onClick={() => handleVote(selectedPost.id, 1)} className="text-gray-500 hover:text-orange-500">
                  <ChevronUp className="w-8 h-8" />
                </button>
                <span className="text-2xl font-medium text-gray-700">{selectedPost.score}</span>
                <button onClick={() => handleVote(selectedPost.id, -1)} className="text-gray-500 hover:text-orange-500">
                  <ChevronDown className="w-8 h-8" />
                </button>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedPost.title}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <span className="font-medium text-blue-600">{selectedPost.username}</span>
                  <span>•</span>
                  <Clock className="w-4 h-4" />
                  <span>{new Date(selectedPost.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedPost.topics.map(topic => (
                    <span
                      key={topic}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getTopicColor(topic)}`}
                    >
                      <Tag className="w-3 h-3" />
                      {topic}
                    </span>
                  ))}
                </div>
                {selectedPost.image && (
                  <div className="mb-4 max-w-md mx-auto">
                    <img src={selectedPost.image} alt="Imagen del debate" className="w-full h-auto rounded-lg object-cover" style={{maxHeight: '300px'}} />
                  </div>
                )}
                <p className="text-gray-700 whitespace-pre-wrap mb-6">{selectedPost.content}</p>
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {selectedPost.comments.length} Respuesta{selectedPost.comments.length !== 1 ? 's' : ''}
                    </h2>
                    <button
                      onClick={() => toggleCommentForm(selectedPost.id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Añadir respuesta
                    </button>
                  </div>
                  {activeCommentForm === selectedPost.id && (
                    <div className="bg-white border border-gray-200 rounded-md p-4 mb-4">
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="comment-username" className="block text-sm font-medium text-gray-700 mb-1">
                            Tu nombre
                          </label>
                          <input
                            id="comment-username"
                            type="text"
                            placeholder="Escribe tu nombre"
                            value={newComments[selectedPost.id]?.username || ''}
                            onChange={(e) => setNewComments(prev => ({
                              ...prev,
                              [selectedPost.id]: { ...prev[selectedPost.id], username: e.target.value },
                            }))}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label htmlFor="comment-content" className="block text-sm font-medium text-gray-700 mb-1">
                            Tu respuesta
                          </label>
                          <textarea
                            id="comment-content"
                            placeholder="Escribe tu respuesta..."
                            value={newComments[selectedPost.id]?.content || ''}
                            onChange={(e) => setNewComments(prev => ({
                              ...prev,
                              [selectedPost.id]: { ...prev[selectedPost.id], content: e.target.value },
                            }))}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={4}
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleComment(selectedPost.id)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                          >
                            Publicar respuesta
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {renderComments(selectedPost.comments, selectedPost.id)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-t-4 border-orange-500 shadow-sm mb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">DebateLibre</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="w-64 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <button className="text-gray-600 hover:text-gray-800">Acerca de</button>
              <button className="text-gray-600 hover:text-gray-800">Productos</button>
              <button className="text-gray-600 hover:text-gray-800">Para equipos</button>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Filtrar por temas</h2>
              <div className="space-y-2">
                {TOPICS.map(topic => (
                  <button
                    key={topic}
                    onClick={() => handleFilterChange(topic)}
                    className={`flex items-center w-full px-3 py-1.5 rounded-full text-sm transition-colors ${
                      selectedFilters.includes(topic)
                        ? getTopicColor(topic)
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Tag className="w-3 h-3 mr-2" />
                    <span>{topic}</span>
                  </button>
                ))}
              </div>
              {selectedFilters.length > 0 && (
                <button
                  onClick={() => setSelectedFilters([])}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-800"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Debates</h2>
                <button
                  onClick={() => setShowNewPostForm(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Nuevo Debate
                </button>
              </div>
              <div className="space-y-4">
                {filteredPosts.map(post => (
                  <div
                    key={post.id}
                    className="flex border-b border-gray-200 pb-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setSelectedPost(post)}
                  >
                    <div className="flex-shrink-0 mr-3 flex flex-col items-center text-center">
                      <span className="text-2xl font-medium text-gray-700">{post.score}</span>
                      <span className="text-sm text-gray-500">votos</span>
                    </div>
                    <div className="flex-shrink-0 mr-3 flex flex-col items-center text-center">
                      <span className="text-2xl font-medium text-gray-700">{post.comments.length}</span>
                      <span className="text-sm text-gray-500">respuestas</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-blue-600 hover:text-blue-800 mb-2">{post.title}</h3>
                      <p className="text-gray-600 mb-2 line-clamp-2">{post.content}</p>
                      <div className="flex flex-wrap gap-2 mb-2">
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
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <span>preguntado {new Date(post.timestamp).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="flex-grow"></span>
                        <span className="font-medium text-blue-600">{post.username}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showNewPostForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Crear nuevo debate</h2>
              <button
                onClick={() => {
                  setShowNewPostForm(false);
                  setSelectedTopics([]);
                  setNewPostImage(null);
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
                <label htmlFor="post-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Título del debate
                </label>
                <input
                  id="post-title"
                  type="text"
                  placeholder="Escribe un título para tu debate"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
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
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                  Contenido del debate
                </label>
                <textarea
                  id="post-content"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="¿Qué quieres debatir?"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label htmlFor="post-image" className="block text-sm font-medium text-gray-700 mb-1">
                  Imagen (opcional)
                </label>
                <input
                  id="post-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewPostImage(e.target.files ? e.target.files[0] : null)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
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

      {filteredPosts.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">No hay debates que coincidan con los temas seleccionados.</p>
        </div>
      )}
    </div>
  );
}

export default App;