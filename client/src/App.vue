<script setup lang="ts">
import { onUnmounted, ref } from "vue";
import DesktopOS from "./components/DesktopOS.vue";
import ParallaxMonitorDive from "./components/ParallaxMonitorDive.vue";
import { fetchProjects } from "./api/projects";

const API_URL = (import.meta as ImportMeta & { env: { VITE_API_URL: string } }).env.VITE_API_URL;

const phase = ref<"intro" | "desktop">("intro");

// Démarre le fetch immédiatement — le résultat sera en cache quand DesktopOS monte
fetchProjects().catch(() => { /* silencieux, DesktopOS gère l'erreur */ });

// Keep-alive : ping toutes les 10 min pour éviter le cold start Render
const ping = () => fetch(`${API_URL}/api/health`, { method: "GET" }).catch(() => {});
const keepAliveTimer = setInterval(ping, 10 * 60 * 1000);
onUnmounted(() => clearInterval(keepAliveTimer));
</script>

<template>
  <ParallaxMonitorDive v-if="phase === 'intro'" @done="phase = 'desktop'" />
  <DesktopOS v-else />
</template>