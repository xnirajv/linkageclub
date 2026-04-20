'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/forms/Textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, X, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  points: number;
}

interface Badge {
  name: string;
  description: string;
  image: string;
  requiredScore: number;
}

export default function CreateAssessmentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 1,
    },
  ]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [prerequisites, setPrerequisites] = useState<string[]>([]);
  const [newPrerequisite, setNewPrerequisite] = useState('');

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
  };

  // Question management
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        points: 1,
      },
    ]);
  };

  const handleRemoveQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const handleQuestionChange = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const handleOptionChange = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { 
            ...q, 
            options: q.options.map((opt, i) => i === optionIndex ? value : opt) 
          }
        : q
    ));
  };

  const handleAddOption = (questionId: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, options: [...q.options, ''] }
        : q
    ));
  };

  const handleRemoveOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => 
      q.id === questionId && q.options.length > 2
        ? { ...q, options: q.options.filter((_, i) => i !== optionIndex) }
        : q
    ));
  };

  // Badge management
  const handleAddBadge = () => {
    setBadges([
      ...badges,
      {
        name: '',
        description: '',
        image: '',
        requiredScore: 90,
      },
    ]);
  };

  const handleBadgeChange = (index: number, field: keyof Badge, value: any) => {
    setBadges(badges.map((b, i) => 
      i === index ? { ...b, [field]: value } : b
    ));
  };

  const handleRemoveBadge = (index: number) => {
    setBadges(badges.filter((_, i) => i !== index));
  };

  // Prerequisites
  const handleAddPrerequisite = () => {
    if (newPrerequisite.trim() && !prerequisites.includes(newPrerequisite.trim())) {
      setPrerequisites([...prerequisites, newPrerequisite.trim()]);
      setNewPrerequisite('');
    }
  };

  const handleRemovePrerequisite = (prereq: string) => {
    setPrerequisites(prerequisites.filter(p => p !== prereq));
  };

  const handleSubmit = () => {
    // Validate and submit
    console.log('Submitting assessment:', {
      ...formData,
      questions,
      badges,
      prerequisites,
    });
    router.push('/dashboard/admin/assessments');
  };

  const handleSaveDraft = () => {
    console.log('Saving draft:', {
      ...formData,
      questions,
      badges,
      prerequisites,
    });
    router.push('/dashboard/admin/assessments');
  };

  return (
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/admin/assessments">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-charcoal-950">Create Assessment</h1>
              <p className="text-charcoal-600">Design a new skill assessment</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button onClick={handleSubmit}>
              <Plus className="mr-2 h-4 w-4" />
              Publish Assessment
            </Button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center font-medium
                ${currentStep >= step 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-charcoal-100 text-charcoal-600'
                }
              `}>
                {step}
              </div>
              {step < 3 && (
                <div className={`
                  flex-1 h-1 mx-2
                  ${currentStep > step ? 'bg-primary-600' : 'bg-charcoal-100'}
                `} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <Card className="p-6 space-y-6">
            <h2 className="text-lg font-semibold">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Assessment Title *</label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., React Advanced Certification"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what this assessment covers..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Skill Name *</label>
                  <Input
                    name="skillName"
                    value={formData.skillName}
                    onChange={handleInputChange}
                    placeholder="e.g., React, Python, AWS"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty Level *</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-charcoal-300 bg-card py-2 px-3"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price (₹) *</label>
                  <Input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0 for free"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (minutes) *</label>
                  <Input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="60"
                    min="5"
                    max="180"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Passing Score (%) *</label>
                  <Input
                    type="number"
                    name="passingScore"
                    value={formData.passingScore}
                    onChange={handleInputChange}
                    placeholder="70"
                    min="50"
                    max="90"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                <Input
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="react, javascript, frontend"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setCurrentStep(2)}>
                Next: Questions
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Questions */}
        {currentStep === 2 && (
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Questions</h2>
              <Button variant="outline" size="sm" onClick={handleAddQuestion}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>

            {questions.map((question, qIndex) => (
              <Card key={question.id} className="p-4 border-2">
                <div className="flex justify-between mb-4">
                  <h3 className="font-medium">Question {qIndex + 1}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveQuestion(question.id)}
                    disabled={questions.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Question *</label>
                    <Input
                      value={question.question}
                      onChange={(e) => handleQuestionChange(question.id, 'question', e.target.value)}
                      placeholder="Enter your question"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Options *</label>
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex gap-2 mb-2">
                        <Input
                          value={option}
                          onChange={(e) => handleOptionChange(question.id, optIndex, e.target.value)}
                          placeholder={`Option ${optIndex + 1}`}
                        />
                        {question.options.length > 2 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveOption(question.id, optIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddOption(question.id)}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Correct Answer *</label>
                      <select
                        value={question.correctAnswer}
                        onChange={(e) => handleQuestionChange(question.id, 'correctAnswer', parseInt(e.target.value))}
                        className="w-full rounded-md border border-charcoal-300 bg-card py-2 px-3"
                      >
                        {question.options.map((_, index) => (
                          <option key={index} value={index}>Option {index + 1}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Points *</label>
                      <Input
                        type="number"
                        value={question.points}
                        onChange={(e) => handleQuestionChange(question.id, 'points', parseInt(e.target.value))}
                        min="1"
                        max="10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Explanation (Optional)</label>
                    <Textarea
                      value={question.explanation || ''}
                      onChange={(e) => handleQuestionChange(question.id, 'explanation', e.target.value)}
                      placeholder="Explain why this answer is correct..."
                      rows={2}
                    />
                  </div>
                </div>
              </Card>
            ))}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button onClick={() => setCurrentStep(3)}>
                Next: Badges & Prerequisites
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Badges & Prerequisites */}
        {currentStep === 3 && (
          <Card className="p-6 space-y-6">
            <h2 className="text-lg font-semibold">Badges & Prerequisites</h2>

            {/* Badges */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Earnable Badges</h3>
                <Button variant="outline" size="sm" onClick={handleAddBadge}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Badge
                </Button>
              </div>

              {badges.map((badge, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium">Badge {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveBadge(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <Input
                      placeholder="Badge Name"
                      value={badge.name}
                      onChange={(e) => handleBadgeChange(index, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Description"
                      value={badge.description}
                      onChange={(e) => handleBadgeChange(index, 'description', e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Image URL"
                        value={badge.image}
                        onChange={(e) => handleBadgeChange(index, 'image', e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Required Score (%)"
                        value={badge.requiredScore}
                        onChange={(e) => handleBadgeChange(index, 'requiredScore', parseInt(e.target.value))}
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                </Card>
              ))}

              {badges.length === 0 && (
                <p className="text-charcoal-500 text-center py-4">No badges added yet</p>
              )}
            </div>

            {/* Prerequisites */}
            <div className="space-y-4">
              <h3 className="font-medium">Prerequisites</h3>
              <div className="flex gap-2">
                <Input
                  value={newPrerequisite}
                  onChange={(e) => setNewPrerequisite(e.target.value)}
                  placeholder="e.g., Basic JavaScript knowledge"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPrerequisite())}
                />
                <Button onClick={handleAddPrerequisite}>Add</Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {prerequisites.map((prereq) => (
                  <Badge
                    key={prereq}
                    variant="skill"
                    className="flex items-center gap-1"
                  >
                    {prereq}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemovePrerequisite(prereq)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                Back
              </Button>
              <Button onClick={handleSubmit}>
                Create Assessment
              </Button>
            </div>
          </Card>
        )}
      </div>
  );
}