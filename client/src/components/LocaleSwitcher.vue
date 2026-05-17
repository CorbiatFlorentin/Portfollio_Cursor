<script setup lang="ts">
import { useI18n } from "../composables/useI18n";

const { locale, switchLocale } = useI18n();
</script>

<template>
  <div class="switcher" aria-label="Language">
    <button
      type="button"
      :class="{ on: locale === 'en' }"
      @click="switchLocale('en')"
    >
      EN
    </button>

    <button
      type="button"
      :class="{ on: locale === 'fr' }"
      @click="switchLocale('fr')"
    >
      FR
    </button>
  </div>
</template>

<style scoped>
.switcher {
  position: fixed;

  top: 14px;
  right: 14px;

  /* FIX */
  z-index: 5;

  display: flex;
  gap: 6px;

  padding: 6px;

  border-radius: 12px;

  border: 1px solid rgba(255, 255, 255, 0.12);

  background: rgba(10, 12, 18, 0.6);

  backdrop-filter: blur(14px);
}

button {
  border: 0;

  padding: 6px 10px;

  border-radius: 8px;

  cursor: pointer;

  color: rgba(255, 255, 255, 0.65);

  background: transparent;

  font-size: 12px;

  transition: all 0.2s ease;
}

button:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

button.on {
  color: #fff;
  background: rgba(120, 200, 255, 0.2);
}
</style>