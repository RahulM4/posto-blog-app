import { useEffect, useMemo, useRef, useState } from 'react';
import ErrorState from './ErrorState.jsx';
import RichTextEditor from './RichTextEditor.jsx';
import { api, resolveMediaUrl } from '../utils/api.js';

const EMPTY_HTML = '';

const isContentEmpty = (html) => {
  if (!html) return true;
  const stripped = html.replace(/<br\s*\/?>/gi, '').replace(/<p>\s*<\/p>/gi, '').replace(/\s|&nbsp;/g, '');
  return stripped.length === 0;
};

const getCategoryId = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value._id || value.id || '';
};

const PostComposer = ({
  mode = 'user',
  categories: categoriesProp,
  onCreated,
  post = null,
  onUpdated,
  submitLabel
}) => {
  const isAdmin = mode === 'admin';
  const postId = post?._id || post?.id;
  const isEditing = Boolean(postId);

  const providedCategories = useMemo(
    () => (Array.isArray(categoriesProp) ? categoriesProp : []),
    [categoriesProp]
  );

  const [categories, setCategories] = useState(providedCategories);
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || EMPTY_HTML);
  const [categoryId, setCategoryId] = useState(getCategoryId(post?.categoryId));
  const [coverImageUrl, setCoverImageUrl] = useState(post?.coverImage?.url || '');
  const [status, setStatus] = useState(post?.status || 'draft');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageError, setImageError] = useState('');
  const [categoriesError, setCategoriesError] = useState('');
  const [categorySearch, setCategorySearch] = useState('');

  const editorRef = useRef(null);
  const contentImageInputRef = useRef(null);
  const coverImageInputRef = useRef(null);

  useEffect(() => {
    setCategories(providedCategories);
  }, [providedCategories]);

  useEffect(() => {
    if (isEditing) {
      setTitle(post?.title || '');
      setContent(post?.content || EMPTY_HTML);
      setCategoryId(getCategoryId(post?.categoryId));
      setCoverImageUrl(post?.coverImage?.url || '');
      if (isAdmin) {
        setStatus(post?.status || 'draft');
      }
    } else {
      setTitle('');
      setContent(EMPTY_HTML);
      setCategoryId('');
      setCoverImageUrl('');
      if (isAdmin) {
        setStatus('draft');
      }
    }
  }, [isEditing, post, isAdmin]);

  useEffect(() => {
    if (isAdmin || providedCategories.length) {
      return;
    }

    let active = true;

    const fetchCategories = async () => {
      try {
        setCategoriesError('');
        const response = await api.getPublicCategories({ type: 'post' });
        const items = response?.data?.categories || [];
        if (active) {
          setCategories(items);
        }
      } catch (err) {
        if (active) {
          setCategoriesError(err.message || 'Unable to load categories.');
        }
      }
    };

    fetchCategories();

    return () => {
      active = false;
    };
  }, [isAdmin, providedCategories.length]);

  const derivedPostCategory = useMemo(() => {
    if (!post) return null;
    if (post.categoryId && typeof post.categoryId === 'object') {
      return post.categoryId;
    }
    const identifier = getCategoryId(post?.categoryId);
    if (!identifier) return null;
    return categories.find((category) => getCategoryId(category) === identifier) || null;
  }, [post, categories]);

  const categoryOptions = useMemo(() => {
    const options = categories.filter((category) => category && (category._id || category.id));
    if (derivedPostCategory) {
      const identifier = getCategoryId(derivedPostCategory);
      const exists = options.some((category) => getCategoryId(category) === identifier);
      if (!exists) {
        options.push(derivedPostCategory);
      }
    }
    return options;
  }, [categories, derivedPostCategory]);

  const filteredCategoryOptions = useMemo(() => {
    const search = categorySearch.trim().toLowerCase();
    if (!search) return categoryOptions;
    return categoryOptions.filter((category) => category.name?.toLowerCase().includes(search));
  }, [categoryOptions, categorySearch]);

  useEffect(() => {
    setCategorySearch('');
  }, [categoryOptions.length]);

  const processImageFile = async (file) => {
    if (!file) return null;
    if (isAdmin) {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.adminUploadMedia(formData);
      const uploaded = response?.data?.media;
      if (!uploaded?.url) return null;
      return resolveMediaUrl(uploaded.url);
    }
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
    return dataUrl;
  };

  const handleInsertImage = () => {
    setImageError('');
    contentImageInputRef.current?.click();
  };

  const handleContentImageSelected = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const url = await processImageFile(file);
      if (!url) throw new Error('Upload failed');
      editorRef.current?.insertImage(url);
      setSuccess('Image inserted into post.');
    } catch (err) {
      setImageError(err.message || 'Unable to insert image.');
    }
  };

  const handleCoverFileSelected = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const url = await processImageFile(file);
      if (!url) throw new Error('Upload failed');
      setCoverImageUrl(url);
      setSuccess('Cover image updated.');
    } catch (err) {
      setError(err.message || 'Unable to set cover image.');
    }
  };

  const handleGenerateCover = () => {
    const seed = Date.now().toString(36);
    setCoverImageUrl(`https://picsum.photos/seed/${seed}/1200/600`);
    setSuccess('Generated a placeholder cover image.');
  };

  const resetForm = () => {
    setTitle('');
    setContent(EMPTY_HTML);
    setCategoryId('');
    setCoverImageUrl('');
    setSuccess('');
    setError('');
    setImageError('');
    if (isAdmin) setStatus('draft');
    editorRef.current?.setContent(EMPTY_HTML);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setError('');
    setSuccess('');
    setImageError('');

    if (categoryOptions.length && !categoryId) {
      setError('Select a category for your post.');
      return;
    }

    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 5) {
      setError('Give your post a title of at least 5 characters.');
      return;
    }

    if (isContentEmpty(content)) {
      setError('Write something before submitting your post.');
      return;
    }

    const payload = {
      title: trimmedTitle,
      content
    };

    if (categoryId) payload.categoryId = categoryId;

    const trimmedCover = coverImageUrl.trim();
    if (trimmedCover) {
      payload.coverImage = { url: trimmedCover };
    } else if (isEditing && post?.coverImage?.url) {
      payload.coverImage = null;
    }

    try {
      setSubmitting(true);
      let shouldRefresh = false;
      let updatedPost = null;
      if (isAdmin) {
        if (isEditing) {
          const response = await api.adminUpdatePost(postId, { ...payload, status });
          updatedPost = response?.data?.post || null;
          shouldRefresh = status === 'published';
          setSuccess('Post updated successfully.');
        } else {
          await api.adminCreatePost({ ...payload, status });
          shouldRefresh = status === 'published';
          setSuccess(status === 'published' ? 'Post published immediately.' : 'Draft created for review.');
        }
      } else {
        if (isEditing) {
          const response = await api.updateMyPost(postId, payload);
          updatedPost = response?.data?.post || null;
          setSuccess('Changes saved. Your post is back in review awaiting approval.');
        } else {
          await api.submitPost(payload);
          setSuccess('Post submitted for review. We will publish it once approved.');
        }
      }
      if (isEditing) {
        if (updatedPost) {
          setTitle(updatedPost.title || '');
          setContent(updatedPost.content || EMPTY_HTML);
          setCategoryId(getCategoryId(updatedPost.categoryId));
          setCoverImageUrl(updatedPost.coverImage?.url || '');
          if (isAdmin) {
            setStatus(updatedPost.status || 'draft');
          }
        }
        onUpdated?.(updatedPost);
        if (!isAdmin) {
          setStatus('review');
        }
      } else {
        resetForm();
        onCreated?.(shouldRefresh);
      }
    } catch (err) {
      setError(err.message || 'Unable to submit post.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-muted bg-surface p-6 shadow-lg shadow-soft">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-primary">
          {isAdmin ? 'AD' : 'ME'}
        </div>
        <div>
          <p className="text-sm font-semibold text-contrast">{isAdmin ? 'Share an update' : "What’s on your mind?"}</p>
          <p className="text-xs text-muted">
            {isAdmin ? 'Posts can be published instantly or saved as drafts.' : 'Your story will be reviewed before publishing.'}
          </p>
        </div>
      </div>

      <input
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder={isAdmin ? 'Post headline' : 'Give your story a title'}
        className="w-full rounded-2xl border border-muted bg-background px-4 py-3 text-sm text-contrast placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
        required
      />

      <RichTextEditor
        ref={editorRef}
        value={content}
        onChange={setContent}
        placeholder={isAdmin ? 'Write your announcement…' : 'Start writing your story…'}
        onRequestInsertImage={handleInsertImage}
      />

      {imageError && <p className="text-xs text-secondary">{imageError}</p>}

      {categoryOptions.length > 0 ? (
        <div className="space-y-2">
          <label htmlFor="post-category" className="block text-sm font-semibold text-contrast">
            Category
          </label>
          <input
            type="text"
            value={categorySearch}
            onChange={(event) => setCategorySearch(event.target.value)}
            placeholder="Search categories"
            className="w-full rounded-2xl border border-muted bg-background px-4 py-2 text-sm text-contrast placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            id="post-category"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="w-full rounded-2xl border border-muted bg-background px-4 py-3 text-sm text-contrast focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Select category</option>
            {filteredCategoryOptions.map((category) => (
              <option key={category._id || category.id} value={category._id || category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {filteredCategoryOptions.length === 0 && (
            <p className="text-xs text-secondary">No categories match that search.</p>
          )}
        </div>
      ) : (
        <p className="text-xs text-secondary">No categories available yet. Ask an admin to create one.</p>
      )}

      {categoriesError && <p className="text-xs text-secondary">{categoriesError}</p>}

      <div className="space-y-2">
        <input
          type="url"
          value={coverImageUrl}
          onChange={(event) => setCoverImageUrl(event.target.value)}
          placeholder="Cover image URL (optional)"
          className="w-full rounded-2xl border border-muted bg-background px-4 py-3 text-sm text-contrast placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <button type="button" onClick={handleGenerateCover} className="rounded-full border border-muted px-3 py-1 hover:border-primary hover:text-secondary">
            Generate cover
          </button>
          <button
            type="button"
            onClick={() => coverImageInputRef.current?.click()}
            className="rounded-full border border-muted px-3 py-1 hover:border-primary hover:text-secondary"
          >
            Upload cover
          </button>
          <button
            type="button"
            onClick={() => setCoverImageUrl('')}
            className="rounded-full border border-muted px-3 py-1 hover:border-primary hover:text-secondary"
          >
            Clear cover
          </button>
        </div>
        {coverImageUrl && (
          <img src={resolveMediaUrl(coverImageUrl)} alt="Cover" className="h-32 w-full rounded-2xl object-cover" />
        )}
      </div>

      {isAdmin && (
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="post-status"
              value="draft"
              checked={status === 'draft'}
              onChange={() => setStatus('draft')}
              className="h-4 w-4"
            />
            Draft
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="post-status"
              value="published"
              checked={status === 'published'}
              onChange={() => setStatus('published')}
              className="h-4 w-4"
            />
            Publish now
          </label>
        </div>
      )}

      {error && <ErrorState message={error} />}
      {success && <p className="text-sm text-secondary">{success}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center rounded-full bg-primary px-6 py-2 text-sm font-semibold text-contrast transition hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting}
        >
          {submitting
            ? isEditing
              ? 'Saving…'
              : 'Posting…'
            : submitLabel || (isEditing ? 'Save changes' : isAdmin ? 'Publish update' : 'Share your story')}
        </button>
      </div>

      <input ref={contentImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleContentImageSelected} />
      <input ref={coverImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverFileSelected} />
    </form>
  );
};

export default PostComposer;
