'use client';

import * as React from 'react';
import Editor from '@monaco-editor/react';
import { cn } from '@/lib/utils/cn';
import { useFormContext } from 'react-hook-form';
import { FormField } from './FormField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/forms/Select';
import { Button } from '@/components/ui/button';
import { Copy, Check, Play } from 'lucide-react';

interface CodeEditorProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  language?: string;
  height?: number;
  readOnly?: boolean;
  showLineNumbers?: boolean;
  className?: string;
}

const languages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'dockerfile', label: 'Dockerfile' },
  { value: 'yaml', label: 'YAML' },
];

const CodeEditor = ({
  name,
  label,
  description,
  required,
  language = 'javascript',
  height = 400,
  readOnly = false,
  showLineNumbers = true,
  className,
}: CodeEditorProps) => {
  const [copied, setCopied] = React.useState(false);
  const [selectedLanguage, setSelectedLanguage] = React.useState(language);
  const { register, setValue, watch } = useFormContext();
  const code = watch(name);

  React.useEffect(() => {
    register(name);
  }, [register, name]);

  const handleCopy = async () => {
    if (code) {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRun = () => {
    // Implement code execution logic
    console.log('Running code:', code);
  };

  const handleEditorChange = (value: string | undefined) => {
    setValue(name, value || '');
  };

  const getLanguageForMonaco = (lang: string) => {
    const map: Record<string, string> = {
      javascript: 'javascript',
      typescript: 'typescript',
      python: 'python',
      java: 'java',
      cpp: 'cpp',
      csharp: 'csharp',
      go: 'go',
      rust: 'rust',
      php: 'php',
      ruby: 'ruby',
      swift: 'swift',
      kotlin: 'kotlin',
      html: 'html',
      css: 'css',
      json: 'json',
      markdown: 'markdown',
      sql: 'sql',
      bash: 'shell',
      dockerfile: 'dockerfile',
      yaml: 'yaml',
    };
    return map[lang] || 'javascript';
  };

  return (
    <FormField name={name} label={label} description={description} required={required}>
      <div className={cn('space-y-2', className)}>
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            {!readOnly && (
              <Button type="button" size="sm" variant="outline" onClick={handleRun}>
                <Play className="mr-1 h-3 w-3" />
                Run
              </Button>
            )}
            <Button type="button" size="sm" variant="outline" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="mr-1 h-3 w-3" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-1 h-3 w-3" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Editor */}
        <div className="overflow-hidden rounded-lg border">
          <Editor
            height={height}
            language={getLanguageForMonaco(selectedLanguage)}
            value={code || ''}
            onChange={handleEditorChange}
            options={{
              readOnly,
              minimap: { enabled: false },
              lineNumbers: showLineNumbers ? 'on' : 'off',
              scrollBeyondLastLine: false,
              fontSize: 14,
              tabSize: 2,
              wordWrap: 'on',
              automaticLayout: true,
              renderWhitespace: 'selection',
              quickSuggestions: true,
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: 'on',
              snippetSuggestions: 'inline',
            }}
            theme="vs-dark"
          />
        </div>
      </div>
    </FormField>
  );
};

export { CodeEditor };

