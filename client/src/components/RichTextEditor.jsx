import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

const TOOLBAR_ACTIONS = [
  { label: 'B', command: 'bold', title: 'Bold' },
  { label: 'I', command: 'italic', title: 'Italic' },
  { label: 'U', command: 'underline', title: 'Underline' },
  { label: 'H1', command: 'formatBlock', value: 'h1', title: 'Heading 1' },
  { label: 'H2', command: 'formatBlock', value: 'h2', title: 'Heading 2' },
  { label: '•', command: 'insertUnorderedList', title: 'Bullet list' },
  { label: '⮞', command: 'insertOrderedList', title: 'Numbered list' },
  { label: '“”', command: 'formatBlock', value: 'blockquote', title: 'Quote' }
];

const RichTextEditor = forwardRef(({ value = '', onChange, placeholder = 'Start typing…', onRequestInsertLink, onRequestInsertImage }, ref) => {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const emitChange = () => {
    if (onChange && editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html === '<br>' ? '' : html);
    }
  };

  const execCommand = (command, commandValue) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emitChange();
  };

  const handleLink = () => {
    const url = typeof onRequestInsertLink === 'function' ? onRequestInsertLink() : window.prompt('Enter URL');
    if (!url) return;
    execCommand('createLink', url.trim());
  };

  useImperativeHandle(ref, () => ({
    focus: () => editorRef.current?.focus(),
    insertImage: (url) => {
      if (!editorRef.current) return;
      editorRef.current.focus();
      document.execCommand('insertImage', false, url);
      emitChange();
    },
    setContent: (html) => {
      if (!editorRef.current) return;
      editorRef.current.innerHTML = html || '';
      emitChange();
    }
  }));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {TOOLBAR_ACTIONS.map((action) => (
          <button
            key={action.label + action.command}
            type="button"
            title={action.title}
            onClick={() => execCommand(action.command, action.value)}
            className="rounded-full border border-muted px-3 py-1 font-semibold text-primary transition hover:border-primary hover:text-heading"
          >
            {action.label}
          </button>
        ))}
        <button
          type="button"
          title="Insert link"
          onClick={handleLink}
          className="rounded-full border border-muted px-3 py-1 font-semibold text-primary transition hover:border-primary hover:text-heading"
        >
          Link
        </button>
        {onRequestInsertImage && (
          <button
            type="button"
            title="Insert image"
            onClick={onRequestInsertImage}
            className="rounded-full border border-muted px-3 py-1 font-semibold text-primary transition hover:border-primary hover:text-heading"
          >
            Image
          </button>
        )}
        <button
          type="button"
          title="Clear formatting"
          onClick={() => execCommand('removeFormat')}
          className="rounded-full border border-muted px-3 py-1 font-semibold text-primary transition hover:border-primary hover:text-heading"
        >
          Clear
        </button>
      </div>

      <div className="relative">
        {!isFocused && (!value || value.replace(/<br\s*\/?>|\s+/g, '') === '') && (
          <span className="pointer-events-none absolute left-4 top-3 text-sm text-muted">{placeholder}</span>
        )}
        <div
          ref={editorRef}
          className="min-h-[160px] w-full rounded-2xl border border-muted bg-background px-4 py-3 text-sm text-body focus:border-primary focus:outline-none"
          contentEditable
          onInput={emitChange}
          onBlur={() => setIsFocused(false)}
          onFocus={() => setIsFocused(true)}
        />
      </div>
    </div>
  );
});

export default RichTextEditor;
