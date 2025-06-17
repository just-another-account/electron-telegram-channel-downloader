import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  // State
  const count = ref(0)
  const name = ref('Tauri App')

  // Getters
  const doubleCount = computed(() => count.value * 2)
  const greetMessage = computed(() => `Hello from ${name.value}!`)

  // Actions
  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  function reset() {
    count.value = 0
  }

  function updateName(newName) {
    name.value = newName
  }

  return {
    // State
    count,
    name,
    // Getters
    doubleCount,
    greetMessage,
    // Actions
    increment,
    decrement,
    reset,
    updateName
  }
})
