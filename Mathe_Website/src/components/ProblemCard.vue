<script setup lang="ts">
import { formatExpressionHtml, type MathProblem } from '../domain/math'
import type { FeedbackState } from '../composables/useWorksheet'

defineProps<{
  problem: MathProblem
  index: number
  answer: string
  feedback?: FeedbackState
  feedbackLabel: string
  showSolutions: boolean
}>()
const emit = defineEmits<{ updateAnswer: [value: string]; check: [] }>()
</script>

<template>
  <article class="problem-card" :class="feedback">
    <div class="problem-index">{{ String(index + 1).padStart(2, '0') }}</div>
    <div class="problem-body">
      <div class="problem-expression" :aria-label="`${problem.display} =`">
        <span v-html="formatExpressionHtml(problem.expression)"></span> <span>=</span>
      </div>
      <div class="answer-row">
        <input
          :value="answer"
          :aria-label="`Antwort für Aufgabe ${index + 1}`"
          inputmode="decimal"
          placeholder="Deine Antwort"
          @input="emit('updateAnswer', ($event.target as HTMLInputElement).value)"
          @keyup.enter="emit('check')"
        />
        <button type="button" @click="emit('check')">Prüfen</button>
      </div>
      <p v-if="feedback" class="feedback-message">{{ feedbackLabel }}</p>
      <div v-if="showSolutions" class="solution">
        <span>Lösungsweg</span>
        <p v-for="step in problem.solution" :key="step.expression">
          <span v-html="step.expressionHtml"></span> = <strong>{{ step.result }}</strong>
        </p>
      </div>
    </div>
  </article>
</template>
