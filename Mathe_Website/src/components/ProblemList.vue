<script setup lang="ts">
import ProblemCard from './ProblemCard.vue'
import type { MathProblem } from '../domain/math'
import type { FeedbackState } from '../composables/useWorksheet'

defineProps<{
  problems: MathProblem[]
  answers: Record<string, string>
  feedback: Record<string, FeedbackState>
  showSolutions: boolean
  feedbackLabel: (problem: MathProblem) => string
}>()
const emit = defineEmits<{
  updateAnswer: [problemId: string, value: string]
  check: [problem: MathProblem]
}>()
</script>

<template>
  <div class="problem-list">
    <ProblemCard
      v-for="(problem, index) in problems"
      :key="problem.id"
      :problem="problem"
      :index="index"
      :answer="answers[problem.id] ?? ''"
      :feedback="feedback[problem.id]"
      :feedback-label="feedbackLabel(problem)"
      :show-solutions="showSolutions"
      @update-answer="emit('updateAnswer', problem.id, $event)"
      @check="emit('check', problem)"
    />
  </div>
</template>
