'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/forms/Textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, X, Save, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  points: number;
}

interface BadgeType {
  name: string;
  description: string;
  image: string;
  requiredScore: number;
}

export default function CreateAssessmentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([
    { id: '1', question: '', options: ['', '', '', ''], correctAnswer: 0, points: 1 },
  ]);
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [prerequisites, setPrerequisites] = useState<string[]>([]);
  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skillName: '',
    level: 'intermediate',
    price: '',
    duration: '',
    passingScore: '70',
    tags: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { 
      id: Date.now().toString(), 
      question: '', 
      options: ['', '', '', ''], 
      correctAnswer: 0, 
      points: 1 
    }]);
  };

  const handleRemoveQuestion = (id: string) => {
    if (questions.length > 1) setQuestions(questions.filter(q => q.id !== id));
  };

  const handleQuestionChange = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleOptionChange = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => q.id === questionId 
      ? { ...q, options: q.options.map((opt, i) => i === optionIndex ? value : opt) } 
      : q
    ));
  };

  const handleAddOption = (questionId: string) => {
    setQuestions(questions.map(q => q.id === questionId 
      ? { ...q, options: [...q.options, ''] } 
      : q
    ));
  };

  const handleRemoveOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => q.id === questionId && q.options.length > 2 
      ? { ...q, options: q.options.filter((_, i) => i !== optionIndex) } 
      : q
    ));
  };

  const handleAddBadge = () => {
    setBadges([...badges, { name: '', description: '', image: '', requiredScore: 90 }]);
  };

  const handleBadgeChange = (index: number, field: keyof BadgeType, value: any) => {
    setBadges(badges.map((b, i) => i === index ? { ...b, [field]: value } : b));
  };

  const handleRemoveBadge = (index: number) => {
    setBadges(badges.filter((_, i) => i !== index));
  };

  const handleAddPrerequisite = () => {
    if (newPrerequisite.trim() && !prerequisites.includes(newPrerequisite.trim())) {
      setPrerequisites([...prerequisites, newPrerequisite.trim()]);
      setNewPrerequisite('');
    }
  };

  const handleRemovePrerequisite = (prereq: string) => {
    setPrerequisites(prerequisites.filter(p => p !== prereq));
  };

  // ✅ Validate before submit
  const validateForm = (): string | null => {
    if (!formData.title || formData.title.length < 3) return 'Title must be at least 3 characters';
    if (!formData.description || formData.description.length < 10) return 'Description must be at least 10 characters';
    if (!formData.skillName) return 'Skill name is required';
    if (!formData.duration || parseInt(formData.duration) < 5) return 'Duration must be at least 5 minutes';
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) return `Question ${i + 1} text is required`;
      const filledOptions = q.options.filter(o => o.trim());
      if (filledOptions.length < 2) return `Question ${i + 1} needs at least 2 options`;
    }
    
    return null; // Valid
  };

  const handleSubmit = async () => {
    // ✅ Validate first
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      alert(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        skillName: formData.skillName,
        level: formData.level,
        price: parseInt(formData.price) || 0,
        duration: parseInt(formData.duration) || 30,
        passingScore: parseInt(formData.passingScore) || 70,
        questions: questions.map(q => ({
          question: q.question,
          options: q.options.filter(opt => opt.trim() !== ''),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
          points: q.points || 1,
        })),
        badges: badges.length > 0 ? badges : undefined,
        prerequisites: prerequisites.length > 0 ? prerequisites : undefined,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      };

      console.log('Submitting:', payload);

      // ✅ FIX: Correct API endpoint
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error response:', result);
        
        if (result.details) {
          const errorMsg = result.details
            .map((e: any) => `${e.field}: ${e.message}`)
            .join('\n');
          setError(errorMsg);
          alert(`Validation failed:\n${errorMsg}`);
        } else {
          setError(result.error || 'Failed to create');
          alert(result.error || 'Failed to create assessment');
        }
        return;
      }

      // Success
      setSuccess(true);
      alert('Assessment created successfully!');
      router.push('/dashboard/admin/assessments');
    } catch (error: any) {
      console.error('Submit error:', error);
      setError(error.message || 'Something went wrong');
      alert('Something went wrong. Check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Assessment created successfully!
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/admin/assessments">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Assessment</h1>
            <p className="text-gray-500">Design a new skill assessment</p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Assessment'}
        </Button>
      </div>

      {/* Step Progress */}
      <div className="flex items-center">
        {['Basic Info', 'Questions', 'Badges'].map((step, idx) => (
          <div key={step} className="flex items-center flex-1">
            <button
              onClick={() => setCurrentStep(idx + 1)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                currentStep >= idx + 1
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {idx + 1}
            </button>
            <span className="ml-2 text-sm hidden sm:inline">{step}</span>
            {idx < 2 && (
              <div
                className={`flex-1 h-1 mx-4 ${
                  currentStep > idx + 1 ? 'bg-primary-600' : 'bg-gray-100'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {currentStep === 1 && (
        <Card className="p-6 space-y-6">
          <h2 className="text-lg font-semibold">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <Input name="title" value={formData.title} onChange={handleInputChange} required placeholder="e.g., React Advanced Certification" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <Textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} required placeholder="Detailed description of the assessment..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Skill Name *</label>
                <Input name="skillName" value={formData.skillName} onChange={handleInputChange} required placeholder="e.g., React.js" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Level *</label>
                <select name="level" value={formData.level} onChange={handleInputChange} className="w-full rounded-md border p-2">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price (₹)</label>
                <Input type="number" name="price" value={formData.price} onChange={handleInputChange} min="0" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration (min)</label>
                <Input type="number" name="duration" value={formData.duration} onChange={handleInputChange} min="5" max="180" placeholder="30" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Passing Score (%)</label>
                <Input type="number" name="passingScore" value={formData.passingScore} onChange={handleInputChange} min="50" max="90" placeholder="70" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
              <Input name="tags" value={formData.tags} onChange={handleInputChange} placeholder="react, javascript, frontend" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setCurrentStep(2)}>Next: Questions</Button>
          </div>
        </Card>
      )}

      {/* Step 2: Questions */}
      {currentStep === 2 && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Questions ({questions.length})</h2>
            <Button variant="outline" size="sm" onClick={handleAddQuestion}>
              <Plus className="h-4 w-4 mr-2" />Add Question
            </Button>
          </div>
          {questions.map((question, qIndex) => (
            <Card key={question.id} className="p-4 border-2">
              <div className="flex justify-between mb-4">
                <h3 className="font-medium">Question {qIndex + 1}</h3>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveQuestion(question.id)} disabled={questions.length === 1}>
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
              <div className="space-y-4">
                <Input value={question.question} onChange={(e) => handleQuestionChange(question.id, 'question', e.target.value)} placeholder="Enter your question" />
                <div>
                  <label className="block text-sm font-medium mb-2">Options</label>
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex gap-2 mb-2">
                      <Input value={option} onChange={(e) => handleOptionChange(question.id, optIndex, e.target.value)} placeholder={`Option ${optIndex + 1}`} />
                      {question.options.length > 2 && (
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveOption(question.id, optIndex)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => handleAddOption(question.id)} className="mt-2">
                    <Plus className="h-4 w-4 mr-2" />Add Option
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Correct Answer</label>
                    <select value={question.correctAnswer} onChange={(e) => handleQuestionChange(question.id, 'correctAnswer', parseInt(e.target.value))} className="w-full rounded-md border p-2">
                      {question.options.map((_, idx) => (
                        <option key={idx} value={idx}>Option {idx + 1}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Points</label>
                    <Input type="number" value={question.points} onChange={(e) => handleQuestionChange(question.id, 'points', parseInt(e.target.value) || 1)} min="1" max="10" />
                  </div>
                </div>
                <Textarea value={question.explanation || ''} onChange={(e) => handleQuestionChange(question.id, 'explanation', e.target.value)} placeholder="Explanation (Optional)" rows={2} />
              </div>
            </Card>
          ))}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
            <Button onClick={() => setCurrentStep(3)}>Next: Badges</Button>
          </div>
        </Card>
      )}

      {/* Step 3: Badges */}
      {currentStep === 3 && (
        <Card className="p-6 space-y-6">
          <h2 className="text-lg font-semibold">Badges & Prerequisites</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Earnable Badges</h3>
              <Button variant="outline" size="sm" onClick={handleAddBadge}>
                <Plus className="h-4 w-4 mr-2" />Add Badge
              </Button>
            </div>
            {badges.map((badge, idx) => (
              <Card key={idx} className="p-4">
                <div className="flex justify-between mb-2">
                  <h4 className="font-medium">Badge {idx + 1}</h4>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveBadge(idx)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <Input placeholder="Badge Name" value={badge.name} onChange={(e) => handleBadgeChange(idx, 'name', e.target.value)} />
                  <Input placeholder="Description" value={badge.description} onChange={(e) => handleBadgeChange(idx, 'description', e.target.value)} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Image URL (optional)" value={badge.image} onChange={(e) => handleBadgeChange(idx, 'image', e.target.value)} />
                    <Input type="number" placeholder="Required Score (%)" value={badge.requiredScore} onChange={(e) => handleBadgeChange(idx, 'requiredScore', parseInt(e.target.value) || 0)} min="0" max="100" />
                  </div>
                </div>
              </Card>
            ))}
            {badges.length === 0 && (
              <p className="text-gray-500 text-center py-4">No badges added yet</p>
            )}
          </div>
          <div className="space-y-4">
            <h3 className="font-medium">Prerequisites</h3>
            <div className="flex gap-2">
              <Input value={newPrerequisite} onChange={(e) => setNewPrerequisite(e.target.value)} placeholder="e.g., Basic JavaScript" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPrerequisite())} />
              <Button onClick={handleAddPrerequisite}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {prerequisites.map((prereq) => (
                <Badge key={prereq} variant="secondary" className="flex items-center gap-1">
                  {prereq}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemovePrerequisite(prereq)} />
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Assessment'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}