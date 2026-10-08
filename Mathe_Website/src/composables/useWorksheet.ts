import { computed, ref } from 'vue'
import {
  DEFAULT_SETTINGS,
  MAX_TASK_COUNT,
  generateProblems,
  type GeneratorSettings,
} from '../domain/generator'
import { formatFraction, type MathProblem, type Operator } from '../domain/math'
import { parseAnswer } from '../services/answerParser'
import { downloadWorksheetPdf } from '../services/pdfExport'

export type FeedbackState = 'correct' | 'incorrect' | 'empty'

export const useWorksheet = () => {
  const settings = ref<GeneratorSettings>({
    ...DEFAULT_SETTINGS,
    operators: [...DEFAULT_SETTINGS.operators],
    numberModes: [...DEFAULT_SETTINGS.numberModes],
  })
  const problems = ref<MathProblem[]>(generateProblems(settings.value))
  const answers = ref<Record<string, string>>({})
  const feedback = ref<Record<string, FeedbackState>>({})
  const incorrectAttempts = ref<Record<string, number>>({})
  const showSolutions = ref(false)
  const generatedAt = ref(new Date())
  const checkedCount = computed(
    () => Object.values(feedback.value).filter((item) => item !== 'empty').length,
  )
  const correctCount = computed(
    () => Object.values(feedback.value).filter((item) => item === 'correct').length,
  )
  const score = computed(() =>
    checkedCount.value === 0 ? 0 : Math.round((correctCount.value / checkedCount.value) * 100),
  )

  const toggleNumberMode = (mode: GeneratorSettings['numberModes'][number]) => {
    const selected = settings.value.numberModes
    if (selected.includes(mode)) {
      if (selected.length > 1) settings.value.numberModes = selected.filter((item) => item !== mode)
    } else settings.value.numberModes = [...selected, mode]
  }

  const toggleOperator = (operator: Operator) => {
    const selected = settings.value.operators
    if (selected.includes(operator)) {
      if (selected.length > 1)
        settings.value.operators = selected.filter((item) => item !== operator)
    } else settings.value.operators = [...selected, operator]
  }

  const checkAnswer = (problem: MathProblem) => {
    const parsed = parseAnswer(answers.value[problem.id] ?? '')
    if (!parsed) {
      feedback.value[problem.id] = 'empty'
      return
    }

    const isCorrect =
      parsed.numerator === problem.answer.numerator &&
      parsed.denominator === problem.answer.denominator

    if (isCorrect) {
      feedback.value[problem.id] = 'correct'
      incorrectAttempts.value[problem.id] = 0
      return
    }

    const attempts = (incorrectAttempts.value[problem.id] ?? 0) + 1
    incorrectAttempts.value[problem.id] = attempts
    feedback.value[problem.id] = 'incorrect'
  }

  const generateWorksheet = () => {
    settings.value.count = Math.min(MAX_TASK_COUNT, Math.max(1, Number(settings.value.count) || 1))
    problems.value = generateProblems(settings.value)
    answers.value = {}
    feedback.value = {}
    incorrectAttempts.value = {}
    showSolutions.value = false
    generatedAt.value = new Date()
  }

  const feedbackLabel = (problem: MathProblem) => {
    const state = feedback.value[problem.id]
    if (state === 'correct') return 'Richtig!'
    if (state === 'incorrect') {
      const attempts = incorrectAttempts.value[problem.id] ?? 0
      const remainingAttempts = 3 - attempts
      if (remainingAttempts <= 0)
        return `Noch nicht. Die Lösung ist ${formatFraction(problem.answer)}.`
      return `Noch ${remainingAttempts} Versuch${remainingAttempts === 1 ? '' : 'e'}.`
    }
    if (state === 'empty') return 'Gib zuerst eine gültige Zahl oder einen Bruch ein.'
    return ''
  }

  const updateAnswer = (problemId: string, value: string) => {
    answers.value[problemId] = value
  }

  const updateSettings = (changes: Partial<GeneratorSettings>) => {
    Object.assign(settings.value, changes)
  }

  const downloadPdf = (withSolutions: boolean) =>
    downloadWorksheetPdf(problems.value, settings.value, generatedAt.value, withSolutions)

  return {
    settings,
    problems,
    answers,
    feedback,
    showSolutions,
    checkedCount,
    score,
    toggleNumberMode,
    toggleOperator,
    checkAnswer,
    generateWorksheet,
    feedbackLabel,
    updateAnswer,
    updateSettings,
    downloadPdf,
  }
}
