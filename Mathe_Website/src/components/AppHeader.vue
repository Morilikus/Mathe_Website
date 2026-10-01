<template>
  <header class="topbar">
    <a class="brand" :href="baseUrl" aria-label="MatheWerkstatt Startseite">
      <span class="brand-mark">∑</span><span>Mathe<span>Werkstatt</span></span>
    </a>
    <div class="topbar-note"><span class="status-dot"></span> Für deine Nachhilfe</div>
  </header>
</template>

<script setup lang="ts">
const baseUrl = import.meta.env.BASE_URL
</script>
