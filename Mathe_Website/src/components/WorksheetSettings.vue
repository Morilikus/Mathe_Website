<script setup lang="ts">
import {
  DIGIT_OPTIONS,
  MAX_TASK_COUNT,
  NUMBER_MODES,
  OPERATION_OPTIONS,
  type GeneratorSettings,
} from '../domain/generator'
import { OPERATORS, type Operator } from '../domain/math'

defineProps<{ settings: GeneratorSettings }>()
const emit = defineEmits<{
  toggleOperator: [operator: Operator]
  toggleNumberMode: [mode: GeneratorSettings['numberModes'][number]]
  updateSettings: [changes: Partial<GeneratorSettings>]
  generate: []
}>()
const minTaskCount = 1

const updateNumber = (
  key: keyof Pick<
    GeneratorSettings,
    | 'digits'
    | 'operations'
    | 'count'
    | 'minimum'
    | 'maximum'
    | 'solutionMinimum'
    | 'solutionMaximum'
  >,
  event: Event,
) => {
  emit('updateSettings', { [key]: Number((event.target as HTMLInputElement).value) })
}

const updateNumberRangeMode = (mode: GeneratorSettings['numberRangeMode']) => {
  emit('updateSettings', { numberRangeMode: mode })
}

const updateParentheses = (event: Event) => {
  emit('updateSettings', { parentheses: (event.target as HTMLInputElement).checked })
}

const updateNegativeNumbers = (event: Event) => {
  emit('updateSettings', { allowNegative: (event.target as HTMLInputElement).checked })
}
</script>

<template>
  <aside class="settings-panel">
    <div class="panel-heading">
      <span class="section-number">01</span>
      <div>
        <h2>Aufgaben auswählen</h2>
        <p>Was soll geübt werden?</p>
      </div>
    </div>
    <div class="control-group">
      <div class="control-label">Rechenarten <span class="hint">Mehrfachauswahl</span></div>
      <div class="operator-grid">
        <button
          v-for="operator in OPERATORS"
          :key="operator.value"
          class="operator-button"
          :class="{ selected: settings.operators.includes(operator.value) }"
          type="button"
          @click="emit('toggleOperator', operator.value)"
        >
          <span>{{ operator.symbol }}</span
          ><small>{{ operator.label }}</small>
        </button>
      </div>
    </div>
    <div class="control-group number-size-group">
      <div class="control-label">Zahlengröße <span class="hint">für Aufgaben</span></div>
      <div class="range-mode-toggle" role="group" aria-label="Art der Zahlengröße">
        <button
          type="button"
          :class="{ selected: settings.numberRangeMode === 'digits' }"
          :aria-pressed="settings.numberRangeMode === 'digits'"
          @click="updateNumberRangeMode('digits')"
        >
          Stellen
        </button>
        <button
          type="button"
          :class="{ selected: settings.numberRangeMode === 'range' }"
          :aria-pressed="settings.numberRangeMode === 'range'"
          @click="updateNumberRangeMode('range')"
        >
          Von–Bis
        </button>
      </div>
      <select
        v-if="settings.numberRangeMode === 'digits'"
        id="digits"
        :value="settings.digits"
        @change="updateNumber('digits', $event)"
      >
        <option v-for="digits in DIGIT_OPTIONS" :key="digits" :value="digits">
          Bis {{ digits }} Stelle{{ digits === 1 ? '' : 'n' }}
        </option>
      </select>
      <div v-else class="number-range">
        <label for="minimum">Von</label>
        <input
          id="minimum"
          :value="settings.minimum"
          type="number"
          step="1"
          @input="updateNumber('minimum', $event)"
        />
        <label for="maximum">Bis</label>
        <input
          id="maximum"
          :value="settings.maximum"
          type="number"
          step="1"
          @input="updateNumber('maximum', $event)"
        />
      </div>
      <label class="checkbox-option range-checkbox"
        ><input
          :checked="settings.allowNegative"
          type="checkbox"
          @change="updateNegativeNumbers"
        /><span><strong>Negative Zahlen</strong><small>z. B. −8</small></span></label
      >
    </div>
    <div class="control-group split-controls">
      <label for="operations">Aufgabenlänge <span class="hint">maximal</span></label>
      <select
        id="operations"
        :value="settings.operations"
        @change="updateNumber('operations', $event)"
      >
        <option v-for="operations in OPERATION_OPTIONS" :key="operations" :value="operations">
          Bis {{ operations }} Schritt{{ operations === 1 ? '' : 'e' }}
        </option>
      </select>
    </div>
    <div class="control-group number-range-group">
      <div class="control-label">Lösungsbereich <span class="hint">für Ergebnisse</span></div>
      <div class="number-range">
        <label for="solution-minimum">Von</label>
        <input
          id="solution-minimum"
          :value="settings.solutionMinimum"
          type="number"
          step="1"
          @input="updateNumber('solutionMinimum', $event)"
        />
        <label for="solution-maximum">Bis</label>
        <input
          id="solution-maximum"
          :value="settings.solutionMaximum"
          type="number"
          step="1"
          @input="updateNumber('solutionMaximum', $event)"
        />
      </div>
    </div>
    <div class="control-group number-mode-group">
      <div class="control-label">Zahlenart <span class="hint">Was soll vorkommen?</span></div>
      <div class="number-mode-list">
        <button
          v-for="mode in NUMBER_MODES"
          :key="mode.value"
          class="number-mode-option"
          :class="{ selected: settings.numberModes.includes(mode.value) }"
          type="button"
          :aria-pressed="settings.numberModes.includes(mode.value)"
          @click="emit('toggleNumberMode', mode.value)"
        >
          <span class="checkbox-mark" aria-hidden="true">{{
            settings.numberModes.includes(mode.value) ? '✓' : ''
          }}</span>
          <span
            ><strong>{{ mode.label }}</strong
            ><small>{{ mode.description }}</small></span
          >
        </button>
      </div>
    </div>
    <div class="control-group parentheses-group">
      <label class="checkbox-option"
        ><input :checked="settings.parentheses" type="checkbox" @change="updateParentheses" /><span
          ><strong>Klammern verwenden</strong><small>z. B. (a + b) · c</small></span
        ></label
      >
    </div>
    <div class="control-group range-group">
      <label for="count"
        >Anzahl Aufgaben <span class="hint">1–{{ MAX_TASK_COUNT }}</span></label
      >
      <input
        id="count"
        :value="settings.count"
        type="number"
        :min="minTaskCount"
        :max="MAX_TASK_COUNT"
        step="1"
        @input="updateNumber('count', $event)"
      />
    </div>
    <button class="primary-button" type="button" @click="emit('generate')">
      <span>Neue Aufgaben erstellen</span><b>→</b>
    </button>
  </aside>
</template>
