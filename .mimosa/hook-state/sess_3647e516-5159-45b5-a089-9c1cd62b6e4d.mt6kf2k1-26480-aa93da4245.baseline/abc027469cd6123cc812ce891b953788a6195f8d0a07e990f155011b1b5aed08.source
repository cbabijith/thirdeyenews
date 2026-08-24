'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { useEffect } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        defaultProtocol: 'https',
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4 bg-white prose-p:my-2 prose-ul:my-2 prose-li:my-1 text-gray-800',
      },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  const setLink = () => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('Enter URL:', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  if (!editor) {
    return null
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex gap-1 p-2 bg-gray-50 border-b border-gray-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`px-2.5 py-1 rounded text-sm transition-colors ${editor.isActive('bold') ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`px-2.5 py-1 rounded text-sm transition-colors ${editor.isActive('italic') ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={!editor.can().chain().focus().toggleBulletList().run()}
          className={`px-2.5 py-1 rounded text-sm transition-colors ${editor.isActive('bulletList') ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={setLink}
          className={`px-2.5 py-1 rounded text-sm transition-colors ${editor.isActive('link') ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
          title="Insert/Remove Link"
        >
          Link
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

