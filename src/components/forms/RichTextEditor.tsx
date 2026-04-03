'use client';

import * as React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Undo,
  Redo,
  Pilcrow,
  Minus,
  Check,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { useFormContext } from 'react-hook-form';
import { FormField } from './FormField';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface RichTextEditorProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  height?: number;
}

const RichTextEditor = ({
  name,
  label,
  description,
  required,
  placeholder = 'Start writing...',
  className,
  height = 400,
}: RichTextEditorProps) => {
  const [linkUrl, setLinkUrl] = React.useState('');
  const [linkModalOpen, setLinkModalOpen] = React.useState(false);
  const { register, setValue, watch } = useFormContext();
  const content = watch(name);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-600 underline underline-offset-2',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Typography,
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none px-4 py-3',
        style: `min-height: ${height}px; max-height: ${height * 2}px; overflow-y: auto;`,
      },
    },
    onUpdate: ({ editor }) => {
      setValue(name, editor.getHTML());
    },
  });

  React.useEffect(() => {
    register(name);
  }, [register, name]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setLinkModalOpen(false);
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const MenuButton = ({
    onClick,
    active = false,
    children,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title?: string;
    disabled?: boolean;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        'h-8 w-8',
        active && 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400'
      )}
      onClick={onClick}
      title={title}
    >
      {children}
    </Button>
  );

  return (
    <FormField name={name} label={label} description={description} required={required}>
      <div className={cn('rounded-lg border', className)}>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 border-b bg-charcoal-100/50 p-2 dark:bg-charcoal-800">
          <div className="flex items-center gap-1">
            <MenuButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              active={editor.isActive('strike')}
              title="Strikethrough"
            >
              <Strikethrough className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              active={editor.isActive('code')}
              title="Code"
            >
              <Code className="h-4 w-4" />
            </MenuButton>
          </div>

          <div className="mx-1 h-4 w-px bg-charcoal-200" />

          <div className="flex items-center gap-1">
            <MenuButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              active={editor.isActive('heading', { level: 1 })}
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive('heading', { level: 2 })}
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor.isActive('heading', { level: 3 })}
              title="Heading 3"
            >
              <Heading3 className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().setParagraph().run()}
              active={editor.isActive('paragraph')}
              title="Paragraph"
            >
              <Pilcrow className="h-4 w-4" />
            </MenuButton>
          </div>

          <div className="mx-1 h-4 w-px bg-charcoal-200" />

          <div className="flex items-center gap-1">
            <MenuButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive('bulletList')}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive('orderedList')}
              title="Ordered List"
            >
              <ListOrdered className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive('blockquote')}
              title="Quote"
            >
              <Quote className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Horizontal Rule"
            >
              <Minus className="h-4 w-4" />
            </MenuButton>
          </div>

          <div className="mx-1 h-4 w-px bg-charcoal-200" />

          <div className="flex items-center gap-1">
            <MenuButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              active={editor.isActive({ textAlign: 'left' })}
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              active={editor.isActive({ textAlign: 'center' })}
              title="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              active={editor.isActive({ textAlign: 'right' })}
              title="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              active={editor.isActive({ textAlign: 'justify' })}
              title="Justify"
            >
              <AlignJustify className="h-4 w-4" />
            </MenuButton>
          </div>

          <div className="mx-1 h-4 w-px bg-charcoal-200" />

          <div className="flex items-center gap-1">
            <MenuButton
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              active={editor.isActive('highlight')}
              title="Highlight"
            >
              <Highlighter className="h-4 w-4" />
            </MenuButton>
            
            <Popover open={linkModalOpen} onOpenChange={setLinkModalOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn('h-8 w-8', editor.isActive('link') && 'bg-primary-100 text-primary-600')}
                  title="Link"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-3">
                  <h4 className="font-medium">Add Link</h4>
                  <Input
                    placeholder="https://example.com"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addLink()}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setLinkModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="button" size="sm" onClick={addLink}>
                      Add
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <MenuButton onClick={addImage} title="Image">
              <ImageIcon className="h-4 w-4" />
            </MenuButton>
          </div>

          <div className="mx-1 h-4 w-px bg-charcoal-200" />

          <div className="flex items-center gap-1">
            <MenuButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo"
            >
              <Undo className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </MenuButton>
          </div>

          <div className="flex-1" />

          {/* Color Picker */}
          <select
            className="h-8 rounded border bg-transparent px-2 text-sm"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            value={editor.getAttributes('textStyle').color || ''}
          >
            <option value="">Default</option>
            <option value="#344A86">Chambray</option>
            <option value="#C2964B">Tussock</option>
            <option value="#407794">Harbour Blue</option>
            <option value="#A3A3A3">New Gray</option>
            <option value="#4B4945">Charred</option>
            <option value="#000000">Black</option>
          </select>
        </div>

        {/* Editor Content */}
        <EditorContent editor={editor} />
      </div>
    </FormField>
  );
};

export { RichTextEditor };
