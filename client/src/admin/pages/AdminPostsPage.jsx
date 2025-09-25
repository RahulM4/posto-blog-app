import { useCallback, useEffect, useState } from 'react';
import Loader from '../../components/Loader.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import PostComposer from '../../components/PostComposer.jsx';
import { api, resolveMediaUrl } from '../../utils/api.js';
import { formatDate } from '../../utils/format.js';

const AdminPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState({ total: 0 });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryFeedback, setCategoryFeedback] = useState({ error: '', success: '' });
  const [editingPost, setEditingPost] = useState(null);
  const [editingLoading, setEditingLoading] = useState(false);
  const [editingError, setEditingError] = useState('');

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.adminGetPosts({ sort: 'createdAt:desc', limit: 50 });
      setPosts(response?.data || []);
      setMeta(response?.meta || {});
    } catch (err) {
      setError(err.message || 'Unable to load posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const fetchCategories = useCallback(async () => {
    try {
      setCategoryFeedback((prev) => ({ ...prev, error: '' }));
      const response = await api.adminGetCategories({ type: 'post' });
      setCategories(response?.data?.categories || []);
    } catch (err) {
      setCategoryFeedback({ error: err.message || 'Unable to load categories', success: '' });
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const beginEditingPost = useCallback(async (targetPost) => {
    if (!targetPost) return;
    setEditingPost(targetPost);
    setEditingError('');
    try {
      setEditingLoading(true);
      const response = await api.adminGetPost(targetPost._id || targetPost.id);
      const fetched = response?.data?.post;
      if (fetched) {
        setEditingPost(fetched);
      }
    } catch (err) {
      setEditingError(err.message || 'Unable to load post for editing.');
    } finally {
      setEditingLoading(false);
    }
  }, []);

  const handleCreateCategory = async (event) => {
    event.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setCategoryFeedback({ error: 'Category name is required.', success: '' });
      return;
    }
    try {
      await api.adminCreateCategory({ name: trimmed, type: 'post' });
      setCategoryFeedback({ error: '', success: 'Category added.' });
      setNewCategoryName('');
      await fetchCategories();
    } catch (err) {
      setCategoryFeedback({ error: err.message || 'Unable to create category.', success: '' });
    }
  };

  const handleApprove = async (postId) => {
    try {
      await api.adminApprovePost(postId);
      await loadPosts();
    } catch (err) {
      setError(err.message || 'Unable to approve post');
    }
  };

  const handleStatus = async (postId, status) => {
    try {
      await api.adminUpdatePost(postId, { status });
      await loadPosts();
    } catch (err) {
      setError(err.message || 'Unable to update post status');
    }
  };

  if (loading) {
    return <Loader message="Loading posts…" />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-heading">Posts</h2>
          <p className="text-sm text-muted">Total posts: {meta.total ?? posts.length}</p>
        </div>
      </header>

      <form onSubmit={handleCreateCategory} className="space-y-3 rounded-3xl border border-muted bg-surface p-5 shadow-sm shadow-soft">
        <h3 className="text-base font-semibold text-heading">Post categories</h3>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            value={newCategoryName}
            onChange={(event) => setNewCategoryName(event.target.value)}
            placeholder="e.g. Tutorials"
            className="w-full rounded-2xl border border-muted bg-background px-4 py-3 text-sm text-body placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-contrast transition hover:bg-heading"
          >
            Add category
          </button>
        </div>
        {categoryFeedback.error && <ErrorState message={categoryFeedback.error} />}
        {categoryFeedback.success && <p className="text-xs text-secondary">{categoryFeedback.success}</p>}
        {categories.length > 0 && (
          <p className="text-xs text-muted">Available: {categories.map((category) => category.name).join(', ')}</p>
        )}
      </form>

      {editingPost ? (
        <div className="space-y-3 rounded-3xl border border-muted bg-surface p-5 shadow-lg shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-heading">Update post</h3>
              <p className="text-xs text-muted">Publishing will immediately reflect on the site.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingPost(null);
                setEditingError('');
              }}
              className="rounded-full border border-muted px-3 py-1 text-xs font-semibold text-muted hover:border-primary hover:text-secondary"
            >
              Cancel edit
            </button>
          </div>
          {editingLoading && <Loader message="Loading post…" />}
          {editingError && <ErrorState message={editingError} />}
          <PostComposer
            mode="admin"
            categories={categories}
            post={editingPost}
            submitLabel="Save changes"
            onUpdated={(updated) => {
              if (updated) {
                setEditingPost(updated);
              }
              loadPosts();
            }}
          />
        </div>
      ) : (
        <PostComposer mode="admin" categories={categories} onCreated={() => loadPosts()} />
      )}

      <div className="space-y-4">
        {posts.length ? (
          posts.map((post) => (
            <article
              key={post._id || post.id}
              className="flex flex-col gap-4 rounded-3xl border border-muted bg-surface p-5 shadow-sm shadow-soft sm:flex-row sm:items-center"
            >
              <div className="flex flex-1 flex-col gap-2">
              <h3 className="text-lg font-semibold text-heading">{post.title}</h3>
              <p className="text-sm text-muted">
                Status: <span className="capitalize text-primary">{post.status}</span> — Submitted {formatDate(post.createdAt, true)}
              </p>
              <p className="text-sm text-muted">
                Author: {post.authorId?.name || post.guestAuthor?.name || 'Unknown'}
              </p>
            </div>
            {post.coverImage?.url && (
              <img
                src={resolveMediaUrl(post.coverImage.url)}
                alt={post.title}
                className="h-20 w-32 rounded-2xl object-cover"
              />
            )}
            <div className="flex flex-wrap items-center gap-2">
              {post.status !== 'published' && (
                <button
                  type="button"
                  onClick={() => handleApprove(post._id || post.id)}
                  className="rounded-full border border-primary bg-accent px-3 py-1 text-xs font-semibold text-primary transition hover:bg-heading hover:text-contrast"
                >
                  Publish
                </button>
              )}
              {post.status !== 'review' && (
                <button
                  type="button"
                  onClick={() => handleStatus(post._id || post.id, 'review')}
                  className="rounded-full border border-primary bg-background px-3 py-1 text-xs font-semibold text-primary transition hover:bg-heading hover:text-contrast"
                >
                  Mark review
                </button>
              )}
              {post.status !== 'draft' && (
                <button
                  type="button"
                  onClick={() => handleStatus(post._id || post.id, 'draft')}
                  className="rounded-full border border-muted bg-background px-3 py-1 text-xs font-semibold text-primary transition hover:bg-heading hover:text-contrast"
                >
                  Move to draft
                </button>
              )}
              <button
                type="button"
                onClick={() => beginEditingPost(post)}
                className="rounded-full border border-muted bg-background px-3 py-1 text-xs font-semibold text-primary transition hover:bg-heading hover:text-contrast"
              >
                Edit
              </button>
              </div>
            </article>
          ))
        ) : (
          <EmptyState title="No posts found" description="Use the composer above to publish your first post." />
        )}
      </div>
    </div>
  );
};

export default AdminPostsPage;
