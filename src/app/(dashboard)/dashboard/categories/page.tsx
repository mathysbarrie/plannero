'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Edit2, Trash2, X, Check, ChevronDown, ChevronRight, HelpCircle, GripVertical } from 'lucide-react'
import type { Business, Category, CategoryQuestion } from '@/types/database.types'

interface CategoryWithQuestions extends Category {
  questions: CategoryQuestion[]
}

export default function CategoriesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [business, setBusiness] = useState<Business | null>(null)
  const [categories, setCategories] = useState<CategoryWithQuestions[]>([])
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)

  // Category form state
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryName, setCategoryName] = useState('')
  const [categoryDescription, setCategoryDescription] = useState('')

  // Question form state
  const [addingQuestionTo, setAddingQuestionTo] = useState<string | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<CategoryQuestion | null>(null)
  const [questionText, setQuestionText] = useState('')
  const [questionType, setQuestionType] = useState<'text' | 'select' | 'number'>('text')
  const [questionOptions, setQuestionOptions] = useState<string[]>([''])
  const [questionRequired, setQuestionRequired] = useState(false)

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    // Load business
    const { data: businessData } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!businessData) {
      router.push('/dashboard')
      return
    }

    const businessTyped = businessData as Business
    setBusiness(businessTyped)

    // Load categories
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('*')
      .eq('business_id', businessTyped.id)
      .order('display_order', { ascending: true })

    // Load questions
    const { data: questionsData } = await supabase
      .from('category_questions')
      .select('*')
      .order('display_order', { ascending: true })

    // Associate questions with categories
    const categoriesWithQuestions = (categoriesData || []).map((cat: Category) => ({
      ...cat,
      questions: (questionsData || []).filter((q: CategoryQuestion) => q.category_id === cat.id)
    }))

    setCategories(categoriesWithQuestions)
    setLoading(false)

    // Expand all categories by default
    if (categoriesWithQuestions.length > 0) {
      setExpandedCategories(new Set(categoriesWithQuestions.map((c: CategoryWithQuestions) => c.id)))
    }
  }

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const resetCategoryForm = () => {
    setCategoryName('')
    setCategoryDescription('')
    setEditingCategory(null)
    setShowCategoryForm(false)
  }

  const resetQuestionForm = () => {
    setQuestionText('')
    setQuestionType('text')
    setQuestionOptions([''])
    setQuestionRequired(false)
    setEditingQuestion(null)
    setAddingQuestionTo(null)
  }

  const handleSaveCategory = async () => {
    if (!business || !categoryName.trim()) return

    setSaving(true)
    const supabase = createClient()

    if (editingCategory) {
      // Update existing
      const { error, data } = await supabase
        .from('categories')
        .update({
          name: categoryName.trim(),
          description: categoryDescription.trim() || null,
        } as never)
        .eq('id', editingCategory.id)
        .select()
        .single()

      if (!error && data) {
        setCategories(categories.map(c =>
          c.id === editingCategory.id
            ? { ...c, name: (data as Category).name, description: (data as Category).description }
            : c
        ))
      }
    } else {
      // Create new
      const { error, data } = await supabase
        .from('categories')
        .insert({
          business_id: business.id,
          name: categoryName.trim(),
          description: categoryDescription.trim() || null,
          display_order: categories.length,
        } as never)
        .select()
        .single()

      if (!error && data) {
        const newCategory = { ...(data as Category), questions: [] }
        setCategories([...categories, newCategory])
        setExpandedCategories(new Set([...Array.from(expandedCategories), newCategory.id]))
      }
    }

    setSaving(false)
    resetCategoryForm()
  }

  const handleDeleteCategory = async (category: Category) => {
    if (!confirm(`Supprimer la categorie "${category.name}" et toutes ses questions ?`)) return

    const supabase = createClient()
    await supabase.from('categories').delete().eq('id', category.id)

    setCategories(categories.filter(c => c.id !== category.id))
  }

  const handleEditCategory = (category: Category) => {
    setCategoryName(category.name)
    setCategoryDescription(category.description || '')
    setEditingCategory(category)
    setShowCategoryForm(true)
  }

  const handleSaveQuestion = async () => {
    const categoryId = editingQuestion?.category_id || addingQuestionTo
    if (!categoryId || !questionText.trim()) return

    setSaving(true)
    const supabase = createClient()

    const questionData = {
      question_text: questionText.trim(),
      question_type: questionType,
      options: questionType === 'select' ? questionOptions.filter(o => o.trim()) : null,
      is_required: questionRequired,
    }

    if (editingQuestion) {
      // Update existing
      const { error, data } = await supabase
        .from('category_questions')
        .update(questionData as never)
        .eq('id', editingQuestion.id)
        .select()
        .single()

      if (!error && data) {
        setCategories(categories.map(c => ({
          ...c,
          questions: c.questions.map(q =>
            q.id === editingQuestion.id ? (data as CategoryQuestion) : q
          )
        })))
      }
    } else {
      // Create new
      const category = categories.find(c => c.id === categoryId)
      const { error, data } = await supabase
        .from('category_questions')
        .insert({
          category_id: categoryId,
          ...questionData,
          display_order: category?.questions.length || 0,
        } as never)
        .select()
        .single()

      if (!error && data) {
        setCategories(categories.map(c =>
          c.id === categoryId
            ? { ...c, questions: [...c.questions, data as CategoryQuestion] }
            : c
        ))
      }
    }

    setSaving(false)
    resetQuestionForm()
  }

  const handleEditQuestion = (question: CategoryQuestion) => {
    setQuestionText(question.question_text)
    setQuestionType(question.question_type)
    setQuestionOptions(question.options || [''])
    setQuestionRequired(question.is_required)
    setEditingQuestion(question)
  }

  const handleDeleteQuestion = async (question: CategoryQuestion) => {
    if (!confirm('Supprimer cette question ?')) return

    const supabase = createClient()
    await supabase.from('category_questions').delete().eq('id', question.id)

    setCategories(categories.map(c => ({
      ...c,
      questions: c.questions.filter(q => q.id !== question.id)
    })))
  }

  const addOption = () => {
    setQuestionOptions([...questionOptions, ''])
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...questionOptions]
    newOptions[index] = value
    setQuestionOptions(newOptions)
  }

  const removeOption = (index: number) => {
    if (questionOptions.length > 1) {
      setQuestionOptions(questionOptions.filter((_, i) => i !== index))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 mt-1">
            Creez vos categories et definissez les questions de qualification
          </p>
        </div>
        <Button onClick={() => setShowCategoryForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle categorie
        </Button>
      </div>

      {/* Category Form Modal */}
      {showCategoryForm && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {editingCategory ? 'Modifier la categorie' : 'Nouvelle categorie'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la categorie *
              </label>
              <Input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Ex: Nettoyage Textile"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optionnel)
              </label>
              <Input
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                placeholder="Ex: Canapes, tapis, matelas..."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveCategory} disabled={saving || !categoryName.trim()}>
                {saving ? 'Enregistrement...' : editingCategory ? 'Modifier' : 'Creer'}
              </Button>
              <Button variant="outline" onClick={resetCategoryForm}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      {categories.length === 0 && !showCategoryForm ? (
        <Card>
          <CardContent className="py-12 text-center">
            <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune categorie</h3>
            <p className="text-gray-500 mb-4">
              Commencez par creer une categorie pour organiser vos prestations
            </p>
            <Button onClick={() => setShowCategoryForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Creer ma premiere categorie
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="flex items-center gap-2 text-left"
                  >
                    {expandedCategories.has(category.id) ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-gray-500">{category.description}</p>
                      )}
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">
                      {category.questions.length} question{category.questions.length !== 1 ? 's' : ''}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditCategory(category)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(category)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedCategories.has(category.id) && (
                <CardContent className="pt-0">
                  {/* Questions List */}
                  <div className="space-y-2 mb-4">
                    {category.questions.length === 0 ? (
                      <p className="text-sm text-gray-400 italic py-2">
                        Aucune question de qualification
                      </p>
                    ) : (
                      category.questions.map((question) => (
                        <div
                          key={question.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <GripVertical className="w-4 h-4 text-gray-300" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                {question.question_text}
                                {question.is_required && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                              </p>
                              <p className="text-xs text-gray-400">
                                Type: {question.question_type === 'text' ? 'Texte libre' :
                                       question.question_type === 'number' ? 'Nombre' : 'Choix'}
                                {question.question_type === 'select' && question.options && (
                                  <span> ({question.options.length} options)</span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditQuestion(question)}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteQuestion(question)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Question Form */}
                  {(addingQuestionTo === category.id || editingQuestion?.category_id === category.id) ? (
                    <div className="p-4 border border-blue-200 rounded-lg bg-blue-50/50 space-y-4">
                      <h4 className="font-medium text-gray-900">
                        {editingQuestion ? 'Modifier la question' : 'Nouvelle question'}
                      </h4>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question *
                        </label>
                        <Input
                          value={questionText}
                          onChange={(e) => setQuestionText(e.target.value)}
                          placeholder="Ex: Combien de places a votre canape ?"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type de reponse
                        </label>
                        <select
                          value={questionType}
                          onChange={(e) => setQuestionType(e.target.value as 'text' | 'select' | 'number')}
                          className="w-full h-10 px-3 border border-gray-300 rounded-md"
                        >
                          <option value="text">Texte libre</option>
                          <option value="number">Nombre</option>
                          <option value="select">Choix multiples</option>
                        </select>
                      </div>

                      {questionType === 'select' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Options
                          </label>
                          <div className="space-y-2">
                            {questionOptions.map((option, index) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  value={option}
                                  onChange={(e) => updateOption(index, e.target.value)}
                                  placeholder={`Option ${index + 1}`}
                                />
                                {questionOptions.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeOption(index)}
                                    className="text-red-600"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={addOption}>
                              <Plus className="w-3 h-3 mr-1" />
                              Ajouter une option
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`required-${category.id}`}
                          checked={questionRequired}
                          onChange={(e) => setQuestionRequired(e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={`required-${category.id}`} className="text-sm text-gray-700">
                          Reponse obligatoire
                        </label>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveQuestion}
                          disabled={saving || !questionText.trim()}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          {editingQuestion ? 'Modifier' : 'Ajouter'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={resetQuestionForm}>
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAddingQuestionTo(category.id)}
                      className="w-full"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Ajouter une question
                    </Button>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
