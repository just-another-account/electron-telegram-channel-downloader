<template>
  <v-menu>
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        variant="text"
        :icon="false"
        class="language-selector"
        :ripple="false"
        color="white"
      >
        <v-icon start color="white">mdi-translate</v-icon>
        {{ currentLanguageDisplay }}
        <v-icon end color="white">mdi-chevron-down</v-icon>
      </v-btn>
    </template>

    <v-list class="language-list">
      <v-list-item
        v-for="lang in supportedLanguages"
        :key="lang.code"
        :value="lang.code"
        @click="changeLanguage(lang.code)"
        :class="{ 'v-list-item--active': currentLanguage === lang.code }"
      >
        <v-list-item-title>
          <span class="font-weight-medium">{{ lang.native }}</span>
          <span class="text-caption text-medium-emphasis ml-2">({{ lang.name }})</span>
        </v-list-item-title>
        <template v-slot:append>
          <v-icon v-if="currentLanguage === lang.code" color="primary">
            mdi-check
          </v-icon>
        </template>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getSupportedLanguages, switchLanguage, getCurrentLanguage } from '@/i18n'

const { locale } = useI18n()

const supportedLanguages = getSupportedLanguages()
const currentLanguage = computed(() => getCurrentLanguage())

const currentLanguageDisplay = computed(() => {
  const lang = supportedLanguages.find(l => l.code === currentLanguage.value)
  return lang ? lang.native : '简体中文'
})

const changeLanguage = (langCode) => {
  switchLanguage(langCode)
  // 触发响应式更新
  locale.value = langCode
}
</script>

<style scoped>
.language-selector {
  text-transform: none !important;
  letter-spacing: normal !important;
  min-width: 120px;
  color: white !important;
}

.language-selector .v-btn__content {
  color: white !important;
}

.language-list {
  min-width: 200px;
  max-height: 400px;
  overflow-y: auto;
}

.v-list-item--active {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.v-list-item:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}
</style> 