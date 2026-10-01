<script setup lang="ts">
defineProps<{ problemCount: number; checkedCount: number; score: number; showSolutions: boolean }>()
const emit = defineEmits<{ download: [withSolutions: boolean]; toggleSolutions: [] }>()
</script>

<template>
  <div class="worksheet-header">
    <div class="panel-heading compact">
      <span class="section-number">02</span>
      <div>
        <h2>Arbeitsblatt</h2>
        <p>{{ problemCount }} Aufgaben · bereit zum Rechnen</p>
      </div>
    </div>
    <div class="header-actions">
      <button
        class="icon-button"
        type="button"
        title="Aufgaben als PDF herunterladen"
        @click="emit('download', false)"
      >
        ↓ <span>PDF</span>
      </button>
      <button
        class="icon-button muted"
        type="button"
        title="Aufgaben und Lösungen herunterladen"
        @click="emit('download', true)"
      >
        ↓ <span>mit Lösungen</span>
      </button>
    </div>
  </div>
  <div class="progress-strip">
    <div>
      <span>Fortschritt</span><strong>{{ checkedCount }} / {{ problemCount }} geprüft</strong>
    </div>
    <div class="progress-track">
      <span :style="{ width: `${(checkedCount / problemCount) * 100}%` }"></span>
    </div>
    <strong class="score">{{ score }}<small>%</small></strong>
  </div>
</template>
