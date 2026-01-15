import type { CategoryQuestion } from '@/types/database.types'

interface QuestionsStepProps {
  questions: CategoryQuestion[]
  answers: Record<string, string>
  onUpdate: (answers: Record<string, string>) => void
  onContinue: () => void
}

export function QuestionsStep({ questions, answers, onUpdate, onContinue }: QuestionsStepProps) {
  const handleChange = (questionId: string, value: string) => {
    onUpdate({ ...answers, [questionId]: value })
  }

  const isValid = questions
    .filter(q => q.is_required)
    .every(q => answers[q.id]?.trim())

  if (questions.length === 0) {
    // No questions, auto-continue
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Aucune question supplementaire</p>
        <button
          onClick={onContinue}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          Continuer
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Quelques questions
      </h2>
      <p className="text-gray-500 mb-6">
        Ces informations nous aident a preparer votre intervention
      </p>

      <div className="space-y-4">
        {questions.map((question) => (
          <div key={question.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {question.question_text}
              {question.is_required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {question.question_type === 'text' && (
              <input
                type="text"
                value={answers[question.id] || ''}
                onChange={(e) => handleChange(question.id, e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Votre reponse..."
              />
            )}

            {question.question_type === 'number' && (
              <input
                type="number"
                value={answers[question.id] || ''}
                onChange={(e) => handleChange(question.id, e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
              />
            )}

            {question.question_type === 'select' && question.options && (
              <select
                value={answers[question.id] || ''}
                onChange={(e) => handleChange(question.id, e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selectionnez...</option>
                {question.options.map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8">
        <button
          onClick={onContinue}
          disabled={!isValid}
          className={`w-full py-3 rounded-xl font-medium transition-colors ${
            isValid
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continuer
        </button>
      </div>
    </div>
  )
}
