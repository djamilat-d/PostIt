
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './assets/main.css'
import App from './App.vue'
import router from './router'

// applique le thème sauvegardé avant même de monter l'appli, pour pas
// avoir un flash du mauvais thème au chargement
const savedTheme = localStorage.getItem('postit_theme')
if (savedTheme === 'light') {
  document.documentElement.dataset.theme = 'light'
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
