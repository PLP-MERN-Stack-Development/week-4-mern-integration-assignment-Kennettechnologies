import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postService } from '../services/api';
import { authService } from '../services/api';

const PostView = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState(null);
  const user = authService.getCurrentUser();

  useEffect(() => {
    postService.getPost(id)
      .then(setPost)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    fetchComments();
    // eslint-disable-next-line
  }, [id]);

  const fetchComments = () => {
    setCommentLoading(true);
    postService.getComments(id)
      .then(setComments)
      .catch((err) => setCommentError(err.message))
      .finally(() => setCommentLoading(false));
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    setCommentLoading(true);
    setCommentError(null);
    try {
      await postService.addComment(id, { text: commentText, user: user.id });
      setCommentText('');
      fetchComments();
    } catch (err) {
      setCommentError(err.response?.data?.error || err.message);
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) return <div>Loading post...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <div>
      <h2>{post.title}</h2>
      <p>{post.content}</p>
      {post.featuredImage && <img src={post.featuredImage} alt="Featured" style={{ maxWidth: 400 }} />}
      <div>Category: {post.category?.name}</div>
      <div>Author: {post.author?.username}</div>
      <Link to={`/posts/${post._id}/edit`}>Edit</Link>
      <hr />
      <h3>Comments</h3>
      {commentLoading ? (
        <div>Loading comments...</div>
      ) : commentError ? (
        <div style={{ color: 'red' }}>{commentError}</div>
      ) : (
        <ul>
          {comments.map((c, i) => (
            <li key={i}>
              <b>{c.user?.username || 'User'}:</b> {c.text} <span style={{ color: '#888', fontSize: 12 }}>{new Date(c.createdAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
      {user ? (
        <form onSubmit={handleAddComment} style={{ marginTop: 16 }}>
          <textarea
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            required
            placeholder="Add a comment..."
            rows={2}
            style={{ width: '100%' }}
          />
          <button type="submit" disabled={commentLoading || !commentText.trim()}>
            {commentLoading ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <div>Login to comment.</div>
      )}
    </div>
  );
};

export default PostView; 