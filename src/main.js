import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import { vuetifyConfig } from './config/vuetify'

// Vue I18n
import i18n from './i18n'

const vuetify = createVuetify({
  components,
  directives,
  ...vuetifyConfig
})

const pinia = createPinia()

const app = createApp(App)
app.use(pinia)
app.use(vuetify)
app.use(i18n)
app.mount("#app")
