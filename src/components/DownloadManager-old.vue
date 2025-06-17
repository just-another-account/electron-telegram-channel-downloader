<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-telegram</v-icon>
            Telegram Channel Downloader
          </v-card-title>
          <v-card-text>
            <v-form>
              <v-text-field
                v-model="channelUrl"
                label="Telegram Channel URL"
                placeholder="https://t.me/channel_name"
                prepend-icon="mdi-link"
                variant="outlined"
                class="mb-4"
              ></v-text-field>
              
              <v-select
                v-model="downloadType"
                :items="downloadTypes"
                label="Download Type"
                variant="outlined"
                class="mb-4"
              ></v-select>
              
              <v-text-field
                v-model="downloadPath"
                label="Download Path"
                prepend-icon="mdi-folder"
                variant="outlined"
                readonly
                class="mb-4"
              >
                <template v-slot:append>
                  <v-btn
                    color="primary"
                    variant="outlined"
                    @click="selectDownloadPath"
                  >
                    Browse
                  </v-btn>
                </template>
              </v-text-field>
              
              <v-row>
                <v-col cols="6">
                  <v-btn
                    color="primary"
                    size="large"
                    block
                    :loading="downloading"
                    :disabled="!canDownload"
                    @click="startDownload"
                  >
                    <v-icon class="mr-2">mdi-download</v-icon>
                    Start Download
                  </v-btn>
                </v-col>
                <v-col cols="6">
                  <v-btn
                    color="error"
                    size="large"
                    block
                    :disabled="!downloading"
                    @click="stopDownload"
                  >
                    <v-icon class="mr-2">mdi-stop</v-icon>
                    Stop Download
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <v-row v-if="downloadProgress.visible" class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>Download Progress</v-card-title>
          <v-card-text>
            <v-progress-linear
              :model-value="downloadProgress.percentage"
              height="20"
              color="primary"
              class="mb-2"
            >
              <template v-slot:default="{ value }">
                <strong>{{ Math.ceil(value) }}%</strong>
              </template>
            </v-progress-linear>
            <p>{{ downloadProgress.message }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDownloadStore } from '../stores/download'

// Store
const downloadStore = useDownloadStore()

// Local state
const channelUrl = ref('')
const downloadType = ref('all')
const downloadPath = ref('')

const downloadTypes = [
  { title: 'All Messages', value: 'all' },
  { title: 'Images Only', value: 'images' },
  { title: 'Videos Only', value: 'videos' },
  { title: 'Documents Only', value: 'documents' }
]

// Computed
const canDownload = computed(() => {
  return channelUrl.value && downloadPath.value && !downloadStore.downloading
})

const downloading = computed(() => downloadStore.downloading)
const downloadProgress = computed(() => downloadStore.progress)

// Methods
function selectDownloadPath() {
  // This would integrate with Tauri's file dialog
  // For now, just set a placeholder
  downloadPath.value = '/Users/Downloads/TelegramChannels'
}

function startDownload() {
  downloadStore.startDownload({
    url: channelUrl.value,
    type: downloadType.value,
    path: downloadPath.value
  })
}

function stopDownload() {
  downloadStore.stopDownload()
}
</script>
