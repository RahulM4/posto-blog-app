import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Loader from '../components/Loader.jsx';
import PageHeading from '../components/PageHeading.jsx';
import PostCard from '../components/PostCard.jsx';
import { api } from '../utils/api.js';
import { formatDate } from '../utils/format.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import PostComposer from '../components/PostComposer.jsx';

const STATUS_INFO = {
  published: {
    label: 'Published',
    className: 'border border-primary bg-accent text-primary',
    message: 'Visible on the homepage and ready to share.'
  },
  review: {
    label: 'In review',
    className: 'border border-secondary bg-background text-secondary',
    message: 'Our editors are checking your story.'
  },
  pending: {
    label: 'Pending review',
    className: 'border border-secondary bg-background text-secondary',
    message: 'Waiting in the review queue. We will update you soon.'
  },
  submitted: {
    label: 'Pending review',
    className: 'border border-secondary bg-background text-secondary',
    message: 'Waiting in the review queue. We will update you soon.'
  },
  rejected: {
    label: 'Rejected',
    className: 'border border-primary bg-background text-primary',
    message: 'This story was rejected. Update it and resubmit for another review.'
  },
  draft: {
    label: 'Draft',
    className: 'border border-muted bg-background text-muted',
    message: 'Not submitted yet. You can continue editing and share when ready.'
  }
};

const MyPostsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [editingLoading, setEditingLoading] = useState(false);
  const [editingError, setEditingError] = useState('');

  const loadPosts = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError('');
      const response = await api.getMyPosts({ sort: 'createdAt:desc', limit: 50 });
      setPosts(response?.data || []);
    } catch (err) {
      setError(err.message || 'Unable to load your posts');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const beginEditingPost = useCallback(
    async (targetPost) => {
      if (!targetPost) return;
      setEditingPost(targetPost);
      setEditingError('');
      try {
        setEditingLoading(true);
        const response = await api.getMyPost(targetPost._id || targetPost.id);
        const fetched = response?.data?.post;
        if (fetched) {
          setEditingPost(fetched);
        }
      } catch (err) {
        setEditingError(err.message || 'Unable to load post for editing.');
      } finally {
        setEditingLoading(false);
      }
    },
    []
  );

  if (authLoading) {
    return <Loader message="Checking your account…" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <section className="space-y-8">
      <PageHeading
        eyebrow="Your stories"
        title="Track your submissions"
        description="Keep an eye on the status of every story you’ve shared with Posto."
      />

      {editingPost && (
        <div className="space-y-4 rounded-3xl border border-muted bg-surface p-6 shadow-lg shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-heading">Edit your story</h2>
              <p className="text-xs text-muted">Saving changes will send this post for a fresh review.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingPost(null);
                setEditingError('');
              }}
              className="rounded-full border border-muted px-3 py-1 text-xs font-semibold text-muted hover:border-primary hover:text-secondary"
            >
              Done editing
            </button>
          </div>
          {editingLoading && <Loader message="Loading post details…" />}
          {editingError && <ErrorState message={editingError} />}
          <PostComposer
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
      )}

      {loading ? (
        <Loader message="Loading your posts…" />
      ) : error ? (
        <ErrorState message={error} />
      ) : posts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description="Use the composer on the homepage to share your first story."
          actionLabel="Share a story"
          actionHref="/"
        />
      ) : (
        <div className="space-y-6">
          {posts.map((post) => {
            const statusInfo = STATUS_INFO[post.status] || {
              label: post.status,
              className: 'border border-muted bg-background text-body',
              message: 'Processing your submission.'
            };
            return (
              <article
                key={post._id || post.id}
                className="rounded-3xl border border-muted bg-surface p-6 shadow-lg shadow-soft"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-heading">{post.title}</h2>
                    <p className="text-sm text-muted">
                      Submitted {formatDate(post.createdAt, true)}
                      {post.publishedAt && post.status === 'published' && ` · Published ${formatDate(post.publishedAt, true)}`}
                    </p>
                  </div>
                  <span className={`inline-flex h-8 items-center rounded-full px-4 text-xs font-semibold ${statusInfo.className}`}>
                    {statusInfo.label}
                  </span>
                </div>

                <p className="mt-3 text-sm text-muted">{statusInfo.message}</p>

                {post.status === 'draft' && (
                  <p className="text-xs text-muted">Publish from the composer to send it for review.</p>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => beginEditingPost(post)}
                    className="rounded-full border border-primary bg-background px-3 py-1 text-xs font-semibold text-primary transition hover:bg-heading hover:text-contrast"
                  >
                    Edit post
                  </button>
                  {post.status === 'published' && (
                    <span className="text-xs text-muted">Editing will hide this story until it’s approved again.</span>
                  )}
                </div>

                {post.status === 'published' && (
                  <div className="mt-4">
                    <PostCard post={post} />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default MyPostsPage;
