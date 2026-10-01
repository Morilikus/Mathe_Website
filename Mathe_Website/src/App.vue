<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import ProblemList from './components/ProblemList.vue'
import WorksheetHeader from './components/WorksheetHeader.vue'
import WorksheetSettings from './components/WorksheetSettings.vue'
import { useWorksheet } from './composables/useWorksheet'

const {
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
} = useWorksheet()
</script>

<template>
  <main class="app-shell">
    <!-- <AppHeader /> -->
    <section class="hero">
      <!-- <div>
        <p class="eyebrow">Mathe fÃ¼r deine Nachhilfe</p>
        <h1>Aufgaben<br /><em>zum Ãœben.</em></h1>
        <p class="hero-copy">
          WÃ¤hle die Rechenarten aus und erstelle schnell ein passendes Arbeitsblatt.
        </p>
      </div> -->
    </section>
    <section class="workspace">
      <WorksheetSettings
        :settings="settings"
        @toggle-operator="toggleOperator"
        @toggle-number-mode="toggleNumberMode"
        @update-settings="updateSettings"
        @generate="generateWorksheet"
      />
      <section class="worksheet-panel">
        <WorksheetHeader
          :problem-count="problems.length"
          :checked-count="checkedCount"
          :score="score"
          :show-solutions="showSolutions"
          @download="downloadPdf"
        />
        <ProblemList
          :problems="problems"
          :answers="answers"
          :feedback="feedback"
          :show-solutions="showSolutions"
          :feedback-label="feedbackLabel"
          @update-answer="updateAnswer"
          @check="checkAnswer"
        />
        <button class="solution-toggle" type="button" @click="showSolutions = !showSolutions">
          {{ showSolutions ? 'Lösungswege ausblenden' : 'Lösungswege anzeigen' }}
          <span>{{ showSolutions ? '↑' : '↓' }}</span>
        </button>
      </section>
    </section>
    <footer><span>Alles bleibt auf diesem Gerät.</span></footer>
  </main>
</template>

<style src="./styles/app.css"></style>
