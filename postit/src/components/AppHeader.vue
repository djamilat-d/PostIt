<template>
  <header class="app-header">
    <router-link to="/" class="app-header__brand">
      <span>Post-it</span>
    </router-link>
    <nav class="app-header__nav">
      <router-link to="/" class="app-header__link">Accueil</router-link>
      <button type="button" class="app-header__theme-toggle" @click="toggleTheme">
        {{ isLight ? 'Mode sombre' : 'Mode clair' }}
      </button>
    </nav>
  </header>
</template>

<script setup>
import { ref } from 'vue'

const THEME_STORAGE_KEY = 'postit_theme'
const isLight = ref(document.documentElement.dataset.theme === 'light')

function toggleTheme() {
  isLight.value = !isLight.value
  if (isLight.value) {
    document.documentElement.dataset.theme = 'light'
    localStorage.setItem(THEME_STORAGE_KEY, 'light')
  } else {
    delete document.documentElement.dataset.theme
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
  }
}
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 1200px;
  height: 64px;
  z-index: 100;
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 8px 28px rgba(21, 14, 41, 0.35);
}

.app-header__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-size: 1.3em;
  font-weight: 800;
  background: linear-gradient(120deg, #ff3d8f, #ffd23f, #00e0c6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.app-header__nav {
  display: flex;
  gap: 20px;
}

.app-header__link {
  position: relative;
  font-weight: 700;
  color: var(--color-on-bg);
  padding-bottom: 2px;
}

.app-header__link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -3px;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #ff3d8f, #00e0c6);
  transition: width 0.2s ease;
}

.app-header__link:hover {
  color: #ffe45e;
}

.app-header__link:hover::after {
  width: 100%;
}

.app-header__theme-toggle {
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: transparent;
  color: var(--color-on-bg);
  font-weight: 700;
  font-size: 0.85em;
  padding: 6px 14px;
  border-radius: 999px;
  transition:
    background-color 0.15s ease,
    transform 0.15s ease;
}

.app-header__theme-toggle:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

@media (max-width: 500px) {
  .app-header {
    width: 94%;
    padding: 0 12px;
  }

  .app-header__theme-toggle {
    padding: 6px 10px;
    font-size: 0.75em;
  }
}
</style>
