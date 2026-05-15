<script setup lang="ts">
import { ref } from "vue";
import DesktopOS from "./components/DesktopOS.vue";
import ParallaxMonitorDive from "./components/ParallaxMonitorDive.vue";

const phase = ref<"intro" | "desktop">("intro");
</script>

<template>
  <ParallaxMonitorDive v-if="phase === 'intro'" @done="phase = 'desktop'" />
  <DesktopOS v-else />
</template>