import React, { useEffect, useMemo, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

export default function RichTextEditor({ value = '', onChange, placeholder = 'Escribe aquí...', className = '' }) {
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  const modules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ align: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['link'],
      ['clean'],
    ],
  }), []);

  useEffect(() => {
    if (!editorRef.current) return;
    if (!quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        modules,
        placeholder,
      });
      quillRef.current.on('text-change', () => {
        const html = editorRef.current.querySelector('.ql-editor')?.innerHTML || '';
        onChange?.(html);
      });
    }
    // Set initial value (HTML)
    const currentHtml = editorRef.current.querySelector('.ql-editor');
    if (currentHtml && value !== undefined) {
      if (currentHtml.innerHTML !== value) {
        currentHtml.innerHTML = value || '';
      }
    }
  }, [modules, placeholder]);

  // Sync external value updates
  useEffect(() => {
    const el = editorRef.current?.querySelector('.ql-editor');
    if (!el) return;
    if (value !== undefined && el.innerHTML !== value) {
      el.innerHTML = value || '';
    }
  }, [value]);

  return <div className={`bg-white ${className}`}>
    <div ref={editorRef} />
  </div>;
}
