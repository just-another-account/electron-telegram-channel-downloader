import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDownloadStore = defineStore('download', () => {
  // State
  const downloading = ref(false)
  const currentDownload = ref(null)
  const downloadHistory = ref([])
  const progress = ref({
    visible: false,
    percentage: 0,
    message: ''
  })

  // Getters
  const totalDownloads = computed(() => downloadHistory.value.length)
  const completedDownloads = computed(() => 
    downloadHistory.value.filter(d => d.status === 'completed').length
  )
  const failedDownloads = computed(() => 
    downloadHistory.value.filter(d => d.status === 'failed').length
  )

  // Actions
  function startDownload(downloadConfig) {
    downloading.value = true
    currentDownload.value = {
      id: Date.now(),
      url: downloadConfig.url,
      type: downloadConfig.type,
      path: downloadConfig.path,
      status: 'downloading',
      startTime: new Date()
    }

    progress.value = {
      visible: true,
      percentage: 0,
      message: 'Initializing download...'
    }

    // Simulate download progress
    simulateDownload()
  }

  function stopDownload() {
    if (currentDownload.value) {
      currentDownload.value.status = 'cancelled'
      addToHistory(currentDownload.value)
    }
    resetDownloadState()
  }

  function simulateDownload() {
    const interval = setInterval(() => {
      if (!downloading.value) {
        clearInterval(interval)
        return
      }

      progress.value.percentage += Math.random() * 10
      
      if (progress.value.percentage >= 100) {
        progress.value.percentage = 100
        progress.value.message = 'Download completed!'
        
        if (currentDownload.value) {
          currentDownload.value.status = 'completed'
          currentDownload.value.endTime = new Date()
          addToHistory(currentDownload.value)
        }
        
        setTimeout(() => {
          resetDownloadState()
        }, 2000)
        
        clearInterval(interval)
      } else {
        progress.value.message = `Downloading... ${Math.floor(progress.value.percentage)}%`
      }
    }, 500)
  }

  function addToHistory(download) {
    downloadHistory.value.unshift({
      ...download,
      endTime: download.endTime || new Date()
    })
  }

  function resetDownloadState() {
    downloading.value = false
    currentDownload.value = null
    progress.value = {
      visible: false,
      percentage: 0,
      message: ''
    }
  }

  function clearHistory() {
    downloadHistory.value = []
  }

  return {
    // State
    downloading,
    currentDownload,
    downloadHistory,
    progress,
    // Getters
    totalDownloads,
    completedDownloads,
    failedDownloads,
    // Actions
    startDownload,
    stopDownload,
    clearHistory,
    resetDownloadState
  }
})
