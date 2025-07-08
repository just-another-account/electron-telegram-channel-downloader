<template>
  <div class="download-manager">
    <v-container fluid class="pa-0">
      <v-row no-gutters class="manager-row">
        <!-- 左侧对话列表 -->
        <v-col cols="12" md="5" lg="4" xl="4" class="sidebar-col">
          <v-card class="sidebar-card h-100" elevation="0" rounded="xl">
            <!-- 侧边栏头部 -->
            <div class="sidebar-header">
              <div class="header-content">
                <div class="d-flex align-center">
                  <v-avatar class="header-avatar me-3" size="32">
                    <v-icon color="white">mdi-chat-outline</v-icon>
                  </v-avatar>
                  <div>
                    <h3 class="header-title">{{ $t('download.dialogList') }}</h3>
                    <p class="header-subtitle">{{ $t('download.selectDialogPrompt') }}</p>
                  </div>
                </div>
                <v-btn 
                  icon 
                  variant="text" 
                  @click="refreshDialogs" 
                  :loading="loadingDialogs"
                  class="refresh-btn"
                  size="small"
                >
                  <v-icon>mdi-refresh</v-icon>
                  <v-tooltip activator="parent" location="bottom">
                    {{ $t('download.refreshDialogs') }}
                  </v-tooltip>
                </v-btn>
              </div>
            </div>
            
            <!-- 对话筛选器 -->
            <div class="dialog-filter pa-4">
              <v-text-field
                v-model="dialogSearchText"
                :placeholder="$t('download.searchDialogPlaceholder')"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                clearable
                hide-details
                class="mb-3"
                @clear="dialogSearchText = ''"
              >
                <template v-slot:append-inner>
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-btn
                        icon
                        variant="text"
                        size="small"
                        v-bind="props"
                        class="filter-options-btn"
                      >
                        <v-icon>mdi-filter-variant</v-icon>
                        <v-tooltip activator="parent" location="bottom">
                          {{ $t('download.filterOptions') }}
                        </v-tooltip>
                      </v-btn>
                    </template>
                    <v-card min-width="240" class="filter-menu">
                      <v-card-text class="pb-2">
                        <div class="text-subtitle-2 mb-2">{{ $t('download.filterByType') }}</div>
                        <v-checkbox
                          v-model="dialogTypeFilters.channels"
                          :label="$t('download.channels')"
                          density="compact"
                          hide-details
                          class="mb-1"
                        ></v-checkbox>
                        <v-checkbox
                          v-model="dialogTypeFilters.groups"
                          :label="$t('download.groups')"
                          density="compact"
                          hide-details
                          class="mb-1"
                        ></v-checkbox>
                        <v-checkbox
                          v-model="dialogTypeFilters.users"
                          :label="$t('download.users')"
                          density="compact"
                          hide-details
                        ></v-checkbox>
                      </v-card-text>
                      <v-card-actions class="pt-0">
                        <v-btn
                          variant="text"
                          size="small"
                          @click="resetDialogFilters"
                        >
                          {{ $t('common.reset') }}
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-menu>
                </template>
              </v-text-field>
              
              <!-- 筛选结果统计 -->
              <div v-if="dialogSearchText || !allDialogTypesSelected" class="filter-info">
                <v-chip
                  size="x-small"
                  variant="tonal"
                  color="primary"
                  class="me-2"
                >
                  {{ filteredDialogs.length }} / {{ dialogs.length }}
                </v-chip>
                <span class="text-caption text-medium-emphasis">
                  {{ $t('download.dialogsFound') }}
                </span>
              </div>
            </div>
            
            <!-- 对话列表内容 -->
            <v-card-text class="pa-0 dialog-list">
              <v-list class="py-0 modern-list">
                <!-- 加载状态 -->
                <template v-if="loadingDialogs">
                  <v-list-item v-for="i in 6" :key="i" class="skeleton-item">
                    <v-skeleton-loader 
                      type="list-item-avatar-two-line" 
                      class="transparent-skeleton"
                    ></v-skeleton-loader>
                  </v-list-item>
                </template>
                
                <!-- 对话项 -->
                <template v-else>
                  <v-list-item
                    v-for="dialog in filteredDialogs"
                    :key="dialog.id"
                    :class="{ 
                      'selected-dialog': selectedDialog?.id === dialog.id,
                      'dialog-item': true
                    }"
                    @click="selectDialog(dialog)"
                    class="modern-dialog-item"
                    rounded="lg"
                  >
                    <template v-slot:prepend>
                      <v-avatar 
                        :color="getDialogColor(dialog)" 
                        class="dialog-avatar"
                        size="48"
                      >
                        <v-icon 
                          :icon="getDialogIcon(dialog)" 
                          color="white"
                          size="24"
                        ></v-icon>
                      </v-avatar>
                    </template>
                    
                    <div class="dialog-content">
                      <v-list-item-title class="dialog-title">
                        {{ dialog.title || dialog.name }}
                      </v-list-item-title>
                      <v-list-item-subtitle class="dialog-meta">
                        <v-chip 
                          :color="getTypeColor(dialog)" 
                          size="x-small" 
                          class="type-chip me-2"
                          variant="tonal"
                        >
                          {{ getDialogType(dialog) }}
                        </v-chip>
                        <span class="dialog-id">ID: {{ dialog.id }}</span>
                      </v-list-item-subtitle>
                    </div>
                    
                    <template v-slot:append>
                      <v-fade-transition>
                        <v-icon 
                          v-if="selectedDialog?.id === dialog.id" 
                          color="primary"
                          class="selected-icon"
                        >
                          mdi-check-circle
                        </v-icon>
                      </v-fade-transition>
                    </template>
                  </v-list-item>
                </template>
                
                <!-- 空状态 -->
                <div v-if="!loadingDialogs && filteredDialogs.length === 0" class="empty-state">
                  <v-icon size="48" color="grey-lighten-1" class="mb-4">
                    mdi-chat-outline
                  </v-icon>
                  <p class="empty-text">
                    {{ dialogs.length === 0 ? $t('common.noData') : $t('download.noMatchingDialogs') }}
                  </p>
                  <v-btn 
                    v-if="dialogs.length === 0"
                    color="primary" 
                    variant="tonal" 
                    @click="refreshDialogs"
                    size="small"
                  >
                    {{ $t('common.refresh') }}
                  </v-btn>
                  <v-btn 
                    v-else
                    color="primary" 
                    variant="tonal" 
                    @click="resetDialogFilters"
                    size="small"
                  >
                    {{ $t('common.reset') }}
                  </v-btn>
                </div>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
        
        <!-- 右侧下载配置 -->
        <v-col cols="12" md="7" lg="8" xl="8" class="main-col">
          <v-card class="main-card h-100" elevation="0" rounded="xl">
            <!-- 主区域头部 -->
            <div class="main-header">
                                  <div class="header-content">
                      <div class="d-flex align-center">
                        <v-avatar class="header-avatar me-3" size="32">
                          <v-icon color="white">mdi-download-outline</v-icon>
                        </v-avatar>
                        <div>
                          <h3 class="header-title">{{ $t('download.title') }}</h3>
                          <p class="header-subtitle">{{ $t('download.subtitle') }}</p>
                        </div>
                      </div>
                      <div class="d-flex align-center gap-2">
                        <v-chip 
                          v-if="selectedDialog" 
                          color="white" 
                          variant="elevated"
                          size="small"
                          class="selected-chip"
                        >
                          <v-icon start size="16">{{ getDialogIcon(selectedDialog) }}</v-icon>
                          {{ selectedDialog.title || selectedDialog.name }}
                        </v-chip>
                      </div>
                    </div>
            </div>
            
            <v-card-text class="main-content pa-8">
              <v-form v-model="formValid" @submit.prevent="startDownload">
                <!-- 选中的对话信息 -->
                <v-expand-transition>
                  <v-alert
                    v-if="selectedDialog"
                    type="info"
                    variant="tonal"
                    icon=""
                    class="mb-8 selected-alert"
                    rounded="xl"
                  >
                    <div class="d-flex align-center">
                      <v-avatar 
                        :color="getDialogColor(selectedDialog)" 
                        size="40" 
                        class="me-4"
                      >
                        <v-icon :icon="getDialogIcon(selectedDialog)" color="white"></v-icon>
                      </v-avatar>
                      <div class="flex-grow-1">
                        <div class="font-weight-bold text-h6 mb-1">
                          {{ selectedDialog.title || selectedDialog.name }}
                        </div>
                        <div class="text-body-2 opacity-75">
                          {{ getDialogType(selectedDialog) }} • ID: {{ selectedDialog.id }}
                        </div>
                      </div>
                    </div>
                  </v-alert>
                </v-expand-transition>

                <!-- 下载记录显示 -->
                <v-expand-transition>
                  <v-alert
                    v-if="selectedDialog && downloadRecordSummary"
                    type="success"
                    variant="tonal"
                    class="mb-8 download-record-alert"
                    icon=""
                    rounded="xl"
                  >
                    <div class="download-record-content">
                      <div class="d-flex align-center mb-3">
                        <v-icon class="me-3" size="24" color="success">mdi-history</v-icon>
                        <div>
                          <div class="font-weight-bold text-h6">{{ $t('download.record.title') }}</div>
                          <div class="text-body-2 opacity-75">{{ $t('download.record.subtitle') }}</div>
                        </div>
                      </div>
                      
                      <div class="record-stats">
                        <div class="stat-row">
                          <div class="stat-item">
                            <v-icon size="16" class="me-2" color="primary">mdi-download</v-icon>
                            <span class="stat-label">{{ $t('download.record.sessions') }}：</span>
                            <span class="stat-value">{{ downloadRecordSummary.totalSessions }}</span>
                          </div>
                          <div class="stat-item">
                            <v-icon size="16" class="me-2" color="success">mdi-file-check</v-icon>
                            <span class="stat-label">{{ $t('download.record.files') }}：</span>
                            <span class="stat-value">{{ downloadRecordSummary.totalDownloaded }}</span>
                          </div>
                        </div>
                        
                        <div class="stat-row" v-if="downloadRecordSummary.messageRange">
                          <div class="stat-item">
                            <v-icon size="16" class="me-2" color="info">mdi-message-text</v-icon>
                            <span class="stat-label">{{ $t('download.record.messageRange') }}：</span>
                            <span class="stat-value">
                              {{ downloadRecordSummary.messageRange.min }} - {{ downloadRecordSummary.messageRange.max }}
                            </span>
                          </div>
                          <div class="stat-item">
                            <v-icon size="16" class="me-2" color="warning">mdi-clock-outline</v-icon>
                            <span class="stat-label">{{ $t('download.record.lastDownload') }}：</span>
                            <span class="stat-value">
                              {{ new Date(downloadRecordSummary.lastDownload).toLocaleDateString() }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </v-alert>
                </v-expand-transition>
                
                <v-expand-transition>
                  <v-alert
                    v-if="!selectedDialog"
                    type="warning"
                    variant="tonal"
                    class="mb-8 selection-prompt"
                    icon=""

                    rounded="xl"
                  >
                    <div class="d-flex align-center">
                      <v-icon class="me-3" size="32">mdi-arrow-left-circle-outline</v-icon>
                      <div>
                        <div class="font-weight-medium text-h6 mb-1">{{ $t('download.selectDialog') }}</div>
                        <div class="text-body-2">{{ $t('download.selectDialogPrompt') }}</div>
                      </div>
                    </div>
                  </v-alert>
                </v-expand-transition>
                
                <!-- 配置表单 -->
                <div class="config-form" :class="{ 'form-disabled': !selectedDialog }">
                  <!-- 下载类型选择 -->
                  <div class="form-section mb-8">
                    <h4 class="section-title mb-4">
                      <v-icon class="me-2" color="primary">mdi-file-multiple-outline</v-icon>
                      {{ $t('download.downloadTypes') }}
                    </h4>
                    <v-select
                      v-model="downloadTypes"
                      :items="downloadTypeOptions"
                      :label="$t('download.selectTypes')"
                      multiple
                      variant="solo"
                      bg-color="surface-variant"
                      :rules="[v => v.length > 0 || $t('download.errors.typesRequired')]"
                      class="modern-select"
                      rounded="xl"
                      hide-details="auto"
                    >
                      <template v-slot:selection="{ item, index }">
                        <v-chip
                          v-if="index < 3"
                          :key="item.value"
                          size="small"
                          class="ma-1"
                          closable
                          @click:close="removeDownloadType(item.value)"
                          :color="item.raw.color"
                          variant="tonal"
                        >
                          <v-icon start :icon="item.raw.icon" size="16"></v-icon>
                          {{ item.title }}
                        </v-chip>
                        <span
                          v-if="index === 3"
                          class="text-grey text-caption align-self-center ma-2"
                        >
                          (+{{ downloadTypes.length - 3 }} {{ $t('common.items') }})
                        </span>
                      </template>
                      <template v-slot:item="{ item, props }">
                        <v-list-item v-bind="props" class="download-type-item">
                          <template v-slot:prepend>
                            <v-avatar :color="item.raw.color" size="32" variant="tonal">
                              <v-icon :icon="item.raw.icon" size="16"></v-icon>
                            </v-avatar>
                          </template>
                          <v-list-item-title>{{ item.title }}</v-list-item-title>
                          <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
                        </v-list-item>
                      </template>
                    </v-select>
                  </div>
                  
                  <!-- 消息ID范围 -->
                  <div class="form-section mb-8">
                    <h4 class="section-title mb-4">
                      <v-icon class="me-2" color="primary">mdi-message-settings-outline</v-icon>
                      {{ $t('download.messageRange') }}
                    </h4>
                    
                    <!-- 已下载消息范围提示 -->
                    <v-expand-transition>
                      <v-alert
                        v-if="selectedDialog && downloadRecordSummary && downloadRecordSummary.messageRange"
                        type="info"
                        variant="tonal"
                        class="mb-4 downloaded-range-alert"
                        rounded="lg"
                      >
                        <div class="d-flex align-center">
                          <v-icon class="me-3" color="info">mdi-information-outline</v-icon>
                          <div class="flex-grow-1">
                            <div class="font-weight-medium">{{ $t('download.record.downloadedRange') }}</div>
                            <div class="text-body-2 mt-1">
                              <span class="font-weight-medium text-primary">
                                {{ downloadRecordSummary.messageRange.min }} - {{ downloadRecordSummary.messageRange.max }}
                              </span>
                              <span class="text-caption ml-2">
                                ({{ $t('common.total') }} {{ downloadRecordSummary.totalDownloaded }} {{ $t('download.record.fileCount') }})
                              </span>
                            </div>
                          </div>
                          <v-chip
                            color="success"
                            variant="tonal"
                            size="small"
                            class="ml-2"
                          >
                            <v-icon start size="14">mdi-check-circle</v-icon>
                            {{ $t('download.progress.downloaded') }}
                          </v-chip>
                        </div>
                      </v-alert>
                    </v-expand-transition>
                    
                    <v-row>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          v-model="startMessageId"
                          :label="$t('download.startMessageId')"
                          type="number"
                          variant="solo"
                          bg-color="surface-variant"
                          :placeholder="$t('download.startMessageIdPlaceholder')"
                          class="modern-input"
                          rounded="xl"
                          hide-details="auto"
                        >
                          <template v-slot:prepend-inner>
                            <v-icon color="primary">mdi-message-text-outline</v-icon>
                          </template>
                        </v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          v-model="endMessageId"
                          :label="$t('download.endMessageId')"
                          type="number"
                          variant="solo"
                          bg-color="surface-variant"
                          :placeholder="$t('download.endMessageIdPlaceholder')"
                          class="modern-input"
                          rounded="xl"
                          hide-details="auto"
                        >
                          <template v-slot:prepend-inner>
                            <v-icon color="primary">mdi-message-text</v-icon>
                          </template>
                        </v-text-field>
                      </v-col>
                    </v-row>
                  </div>
                  
                  <!-- 文件名过滤 -->
                  <div class="form-section mb-8">
                    <h4 class="section-title mb-4">
                      <v-icon class="me-2" color="primary">mdi-filter-outline</v-icon>
                      {{ $t('download.filenameFilter') }}
                    </h4>
                    <v-text-field
                      v-model="filenameFilter"
                      :label="$t('download.filenameFilterLabel')"
                      variant="solo"
                      bg-color="surface-variant"
                      :placeholder="'例如: 视频|电影|music 或 .jpg|.png'"
                      class="modern-input"
                      rounded="xl"
                      hide-details="auto"
                      clearable
                    >
                      <template v-slot:prepend-inner>
                        <v-icon color="primary">mdi-magnify</v-icon>
                      </template>
                    </v-text-field>
                    
                    <!-- 关键字chips显示 -->
                    <div v-if="filenameFilter && filenameFilter.trim()" class="mt-3 filter-keywords-section">
                      <div class="d-flex flex-wrap align-center filter-keywords-chips">
                        <span class="text-caption text-medium-emphasis me-2">过滤关键字：</span>
                        <v-chip
                          v-for="(keyword, index) in filenameFilterKeywords"
                          :key="index"
                          size="small"
                          :color="filterMode === 'exclude' ? 'error' : 'success'"
                          variant="tonal"
                          class="ma-1"
                        >
                          <v-icon start size="14">
                            {{ filterMode === 'exclude' ? 'mdi-minus-circle' : 'mdi-check-circle' }}
                          </v-icon>
                          {{ keyword }}
                        </v-chip>
                        <v-chip
                          v-if="filenameFilterKeywords.length > 1"
                          size="small"
                          color="info"
                          variant="outlined"
                          class="ma-1"
                        >
                          <v-icon start size="14">mdi-information-outline</v-icon>
                          任一匹配
                        </v-chip>
                      </div>
                    </div>
                    
                    <!-- 过滤模式选择 -->
                    <div v-if="filenameFilter && filenameFilter.trim()" class="mt-4">
                      <v-radio-group 
                        v-model="filterMode" 
                        inline 
                        hide-details
                        class="filter-mode-group"
                      >
                        <v-radio 
                          :label="$t('download.filterModeInclude')" 
                          value="include"
                          color="success"
                        >
                          <template v-slot:label>
                            <div class="d-flex align-center">
                              {{ $t('download.filterModeInclude') }}
                            </div>
                          </template>
                        </v-radio>
                        <v-radio 
                          :label="$t('download.filterModeExclude')" 
                          value="exclude"
                          color="error"
                        >
                          <template v-slot:label>
                            <div class="d-flex align-center">
                              {{ $t('download.filterModeExclude') }}
                            </div>
                          </template>
                        </v-radio>
                      </v-radio-group>
                    </div>
                    
                    <div class="mt-3">
                      <v-alert
                        type="info"
                        variant="tonal"
                        density="compact"
                        rounded="lg"
                        class="filter-help"
                      >
                        <div class="text-body-2">
                          {{ 
                            filenameFilter && filenameFilter.trim() 
                              ? (filterMode === 'exclude' 
                                  ? '将排除包含任一关键字的文件。使用 | 分隔多个关键字' 
                                  : '只下载包含任一关键字的文件。使用 | 分隔多个关键字'
                                )
                              : '可以按文件名过滤文件。支持多个关键字，使用 | 分隔'
                          }}
                        </div>
                        <div class="mt-2 text-caption opacity-75">
                          {{ 
                            filenameFilter && filenameFilter.trim() 
                              ? (filterMode === 'exclude' 
                                  ? '示例：video|mp4|avi - 排除包含 video、mp4 或 avi 的文件' 
                                  : '示例：image|jpg|png - 只下载包含 image、jpg 或 png 的文件'
                                )
                              : '示例：video|mp4 表示匹配包含 video 或 mp4 的文件名'
                          }}
                        </div>
                      </v-alert>
                    </div>
                  </div>
                  
                  <!-- 文件大小过滤 -->
                  <div class="form-section mb-8">
                    <h4 class="section-title mb-4">
                      <v-icon class="me-2" color="primary">mdi-file-document-outline</v-icon>
                      {{ $t('download.fileSizeFilter') }}
                    </h4>
                    <v-row>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          v-model.number="minFileSize"
                          :label="$t('download.minFileSizeLabel')"
                          variant="solo"
                          bg-color="surface-variant"
                          :placeholder="$t('download.minFileSizePlaceholder')"
                          class="modern-input"
                          type="number"
                          min="0"
                          step="1"
                          rounded="xl"
                          hide-details="auto"
                          clearable
                          suffix="KB"
                        >
                          <template v-slot:prepend-inner>
                            <v-icon color="primary">mdi-chevron-up</v-icon>
                          </template>
                        </v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          v-model.number="maxFileSize"
                          :label="$t('download.maxFileSizeLabel')"
                          variant="solo"
                          bg-color="surface-variant"
                          :placeholder="$t('download.maxFileSizePlaceholder')"
                          class="modern-input"
                          type="number"
                          min="0"
                          step="1"
                          rounded="xl"
                          hide-details="auto"
                          clearable
                          suffix="KB"
                        >
                          <template v-slot:prepend-inner>
                            <v-icon color="primary">mdi-chevron-down</v-icon>
                          </template>
                        </v-text-field>
                      </v-col>
                    </v-row>
                    
                    <div class="mt-3">
                      <v-alert
                        type="info"
                        variant="tonal"
                        density="compact"
                        rounded="lg"
                        class="filter-help"
                      >
                        <div class="text-body-2">
                          {{ $t('download.fileSizeFilterHelp') }}
                        </div>
                        <div class="mt-2 text-caption opacity-75">
                          {{ $t('download.fileSizeFilterExample') }}
                        </div>
                      </v-alert>
                    </div>
                  </div>
                  
                  <!-- 下载路径 -->
                  <div class="form-section mb-8">
                    <h4 class="section-title mb-4">
                      <v-icon class="me-2" color="primary">mdi-folder-outline</v-icon>
                      {{ $t('download.downloadPath') }}
                    </h4>
                    <v-text-field
                      v-model="downloadPath"
                      :label="$t('download.selectPath')"
                      variant="solo"
                      bg-color="surface-variant"
                      :rules="[v => !!v || $t('download.errors.pathRequired')]"
                      class="modern-input path-input"
                      readonly
                      rounded="xl"
                      hide-details="auto"
                      @click="selectDownloadPath"
                    >
                      <template v-slot:prepend-inner>
                        <v-icon color="primary">mdi-folder</v-icon>
                      </template>
                      <template v-slot:append-inner>
                        <v-btn 
                          icon 
                          variant="text" 
                          @click="selectDownloadPath"
                          size="small"
                        >
                          <v-icon>mdi-folder-open</v-icon>
                          <v-tooltip activator="parent" location="top">
                            {{ $t('download.selectPath') }}
                          </v-tooltip>
                        </v-btn>
                      </template>
                    </v-text-field>
                  </div>
                  
                  <!-- 下载路径说明 -->
                  <v-expand-transition>
                    <v-alert 
                      v-if="downloadPath && selectedDialog"
                      type="info" 
                      variant="tonal" 
                      class="mb-8 path-info"
                      rounded="xl"
                    >
                      <div class="d-flex align-start">
                        <div>
                          <div class="font-weight-medium mb-2">{{ $t('download.structure.saveToPath') }}：</div>
                          <div class="path-preview mb-3">
                            <code>{{ downloadPath }}/{{ selectedDialog.id }}/</code>
                          </div>
                          <div class="folder-structure">
                            <div class="structure-item">
                              <v-icon size="16" class="me-2">mdi-folder-outline</v-icon>
                              <span>json/ - {{ $t('download.structure.jsonFolder') }}</span>
                            </div>

                            <div class="structure-item">
                              <v-icon size="16" class="me-2">mdi-folder-image</v-icon>
                              <span>images/ - {{ $t('download.structure.imagesFolder') }}</span>
                            </div>
                            <div class="structure-item">
                              <v-icon size="16" class="me-2">mdi-folder-play</v-icon>
                              <span>videos/ - {{ $t('download.structure.videosFolder') }}</span>
                            </div>
                            <div class="structure-item">
                              <v-icon size="16" class="me-2">mdi-folder-text-outline</v-icon>
                              <span>documents/ - {{ $t('download.structure.documentsFolder') }}</span>
                            </div>
                            <div class="structure-item">
                              <v-icon size="16" class="me-2">mdi-folder-outline</v-icon>
                              <span>others/ - {{ $t('download.structure.othersFolder') }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </v-alert>
                  </v-expand-transition>
                  
                  <!-- 下载按钮区域 -->
                  <div class="download-buttons-section">
                    <v-btn
                      type="submit"
                      color="primary"
                      size="x-large"
                      :disabled="!selectedDialog || !formValid || isDownloading"
                      :loading="isDownloading"
                      class="download-btn flex-grow-1"
                      rounded="xl"
                    >
                      <v-icon start size="24">
                        {{ isDownloading ? 'mdi-download' : 'mdi-download' }}
                      </v-icon>
                      {{ isDownloading ? $t('download.progress.downloading') + '...' : $t('download.startDownload') }}
                    </v-btn>
                    
                    <v-btn
                      color="orange"
                      variant="tonal"
                      size="x-large"
                      :disabled="isDownloading"
                      class="reset-btn ml-3"
                      rounded="xl"
                      @click="resetForm"
                    >
                      <v-icon size="24">mdi-refresh</v-icon>
                      {{ $t('download.resetForm') }}
                      <v-tooltip activator="parent" location="top">
                        {{ $t('download.resetForm') }}
                      </v-tooltip>
                    </v-btn>
                  </div>
                </div>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    
    <!-- 下载进度对话框 -->
    <v-dialog 
      v-model="showProgressDialog" 
      persistent 
      width="600"
      class="progress-dialog"
    >
      <v-card class="progress-card" rounded="xl" elevation="24">
        <div class="progress-header">
          <div class="header-content">
            <v-avatar class="header-avatar me-3" size="32">
              <v-icon color="white">mdi-download</v-icon>
            </v-avatar>
            <div>
              <h3 class="header-title">{{ $t('download.progress.title') }}</h3>
              <p class="header-subtitle">{{ $t('download.progress.preparing') }}</p>
            </div>
          </div>
        </div>
        
        <v-card-text class="pa-8">
          <!-- 总体进度 -->
          <div class="progress-section mb-6">
            <div class="d-flex justify-space-between align-center mb-3">
              <span class="progress-label">{{ $t('download.progress.totalProgress') }}</span>
              <span class="progress-count">
                <template v-if="downloadProgress.total && downloadProgress.total > 0">
                  {{ downloadProgress.current }} / {{ downloadProgress.total }}
                </template>
                <template v-else>
                  {{ downloadProgress.current || 0 }}
                </template>
              </span>
            </div>
            <v-progress-linear
              :model-value="downloadProgress.total > 0 ? (downloadProgress.current / downloadProgress.total) * 100 : 0"
              height="12"
              color="primary"
              rounded
              class="progress-bar"
            ></v-progress-linear>
          </div>
          
          <!-- 当前状态 -->
          <div class="status-section mb-6">
            <div class="current-file mb-2">
              <v-icon class="me-2" color="primary">mdi-file-outline</v-icon>
              <span class="font-weight-medium">{{ downloadProgress.currentFile || $t('download.progress.preparing') }}</span>
            </div>
            <div class="status-text mb-3">
              {{ downloadProgress.status || $t('download.progress.preparing') }}
            </div>
            
            <!-- 当前文件下载进度 -->
            <div v-if="downloadProgress.currentFile && downloadProgress.fileProgress !== undefined" class="file-progress-section">
              <div class="d-flex justify-space-between align-center mb-2">
                <span class="file-progress-label">{{ $t('download.progress.fileProgress') }}</span>
                <span class="file-progress-percent">{{ downloadProgress.fileProgress.toFixed(1) }}%</span>
              </div>
              <v-progress-linear
                :model-value="downloadProgress.fileProgress"
                height="8"
                color="secondary"
                rounded
                class="file-progress-bar"
              ></v-progress-linear>
            </div>
          </div>
          
          <v-divider class="my-6"></v-divider>
          
          <!-- 统计信息 -->
          <div class="stats-grid">
            <div class="stat-item">
              <v-icon color="success" class="stat-icon">mdi-check-circle</v-icon>
              <div class="stat-content">
                <div class="stat-number">{{ downloadProgress.downloaded }}</div>
                <div class="stat-label">{{ $t('download.progress.downloaded') }}</div>
              </div>
            </div>
            <div class="stat-item">
              <v-icon color="warning" class="stat-icon">mdi-skip-next-circle</v-icon>
              <div class="stat-content">
                <div class="stat-number">{{ downloadProgress.skipped }}</div>
                <div class="stat-label">{{ $t('download.progress.skipped') }}</div>
              </div>
            </div>
            <div class="stat-item">
              <v-icon color="error" class="stat-icon">mdi-alert-circle</v-icon>
              <div class="stat-content">
                <div class="stat-number">{{ downloadProgress.errors }}</div>
                <div class="stat-label">{{ $t('download.progress.errors') }}</div>
              </div>
            </div>
          </div>
        </v-card-text>
        
        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn 
            @click="cancelDownload" 
            :color="cancelButtonProps.color"
            variant="tonal"
            size="large"
            rounded="lg"
          >
            <v-icon start>{{ cancelButtonProps.icon }}</v-icon>
            {{ cancelButtonProps.text }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTelegramStore } from '../stores/telegram'
import downloadService from '../services/downloadService'

const { t } = useI18n()

const telegramStore = useTelegramStore()

// 响应式数据
const dialogs = ref([])
const selectedDialog = ref(null)
const loadingDialogs = ref(false)
const formValid = ref(false)
const isDownloading = ref(false)
const showProgressDialog = ref(false)
const downloadRecord = ref(null)

// 对话筛选相关
const dialogSearchText = ref('')
const dialogTypeFilters = ref({
  channels: true,
  groups: true,
  users: true
})

// 表单数据
const downloadTypes = ref(['images', 'videos'])
const startMessageId = ref('')
const endMessageId = ref('')
const downloadPath = ref('')
const filenameFilter = ref('')
const filterMode = ref('include') // 'include' 或 'exclude'
const minFileSize = ref(null) // 最小文件大小 (KB)
const maxFileSize = ref(null) // 最大文件大小 (KB)

// 下载进度
const downloadProgress = ref({
  current: 0,
  total: 0,
  currentFile: '',
  status: '',
  downloaded: 0,
  skipped: 0,
  errors: 0,
  fileProgress: 0  // 当前文件下载进度 (0-100)
})

// 下载类型选项
const downloadTypeOptions = computed(() => [
  {
    title: t('download.types.images'),
    value: 'images',
    icon: 'mdi-image',
    color: 'success',
    description: '下载图片和照片文件'
  },
  {
    title: t('download.types.videos'),
    value: 'videos',
    icon: 'mdi-video',
    color: 'error',
    description: '下载视频和动画文件'
  },
  {
    title: t('download.types.documents'),
    value: 'documents',
    icon: 'mdi-file-document',
    color: 'info',
    description: '下载文档和文本文件'
  },
  {
    title: t('download.types.others'),
    value: 'others',
    icon: 'mdi-file',
    color: 'warning',
    description: '下载其他类型文件'
  }
])

// 计算属性 - 文件名过滤关键字
const filenameFilterKeywords = computed(() => {
  if (!filenameFilter.value || !filenameFilter.value.trim()) {
    return []
  }
  return filenameFilter.value.trim().split('|').map(k => k.trim()).filter(k => k.length > 0)
})

// 计算属性 - 筛选后的对话列表
const filteredDialogs = computed(() => {
  let result = dialogs.value
  
  // 按搜索文本筛选
  if (dialogSearchText.value && dialogSearchText.value.trim()) {
    const searchText = dialogSearchText.value.trim().toLowerCase()
    result = result.filter(dialog => {
      const title = (dialog.title || '').toLowerCase()
      const name = (dialog.name || '').toLowerCase()
      const id = String(dialog.id || '').toLowerCase()
      
      return title.includes(searchText) || 
             name.includes(searchText) || 
             id.includes(searchText)
    })
  }
  
  // 按类型筛选
  result = result.filter(dialog => {
    if (dialog.isChannel && !dialogTypeFilters.value.channels) return false
    if (dialog.isGroup && !dialogTypeFilters.value.groups) return false
    if (dialog.isUser && !dialogTypeFilters.value.users) return false
    return true
  })
  
  return result
})

// 计算属性 - 是否选择了所有对话类型
const allDialogTypesSelected = computed(() => {
  return dialogTypeFilters.value.channels && 
         dialogTypeFilters.value.groups && 
         dialogTypeFilters.value.users
})

// 计算属性
const downloadRecordSummary = computed(() => {
  if (!downloadRecord.value) return null
  
  const sessions = downloadRecord.value.downloadSessions || []
  if (sessions.length === 0) return null
  
  const totalDownloaded = sessions.reduce((sum, session) => sum + session.downloaded, 0)
  const totalErrors = sessions.reduce((sum, session) => sum + session.errors, 0)
  const lastSession = sessions[sessions.length - 1]
  
  return {
    totalSessions: sessions.length,
    totalDownloaded,
    totalErrors,
    lastDownload: lastSession.timestamp,
    messageRange: downloadRecord.value.totalRange
  }
})

// 计算下载是否完成
const isDownloadCompleted = computed(() => {
  return downloadProgress.value.status && 
         (downloadProgress.value.status.includes(t('download.progress.completed')) || 
          downloadProgress.value.status.includes(t('download.progress.failed')))
})

// 计算按钮文本和图标
const cancelButtonProps = computed(() => {
  if (isDownloadCompleted.value) {
    return {
      text: t('common.close'),
      icon: 'mdi-close',
      color: 'primary'
    }
  } else {
    return {
      text: t('download.cancelDownload'),
      icon: 'mdi-stop-circle',
      color: 'error'
    }
  }
})

// 方法
async function refreshDialogs() {
  loadingDialogs.value = true
  try {
    const dialogsList = await telegramStore.getDialogs()
    dialogs.value = dialogsList.map(dialog => ({
      id: dialog.id?.value || dialog.id,
      title: dialog.title || dialog.name || dialog.firstName || t('dialog.unknown'),
      name: dialog.name || dialog.firstName || '',
      isChannel: dialog.isChannel || dialog.broadcast || false,
      isGroup: dialog.isGroup || dialog.megagroup || false,
      isUser: dialog.isUser || (!dialog.isChannel && !dialog.isGroup),
      entity: dialog.entity || dialog
    }))
  } catch (error) {
    console.error('❌ 获取对话列表失败:', error)
  } finally {
    loadingDialogs.value = false
  }
}

function selectDialog(dialog) {
  selectedDialog.value = dialog
  loadDownloadRecord(dialog.id)
}

// 重置对话筛选器
function resetDialogFilters() {
  dialogSearchText.value = ''
  dialogTypeFilters.value = {
    channels: true,
    groups: true,
    users: true
  }
}

// 加载下载记录
function loadDownloadRecord(channelId) {
  // 强制清空先前的记录
  downloadRecord.value = null
  
  // 重新获取记录
  const record = downloadService.getChannelDownloadRecord(channelId)
  downloadRecord.value = record
}

function getDialogColor(dialog) {
  if (dialog.isChannel) return 'telegram-blue'
  if (dialog.isGroup) return 'secondary'
  return 'primary'
}

function getDialogIcon(dialog) {
  if (dialog.isChannel) return 'mdi-bullhorn'
  if (dialog.isGroup) return 'mdi-account-group'
  return 'mdi-account'
}

function getTypeColor(dialog) {
  if (dialog.isChannel) return 'telegram-blue'
  if (dialog.isGroup) return 'secondary'
  return 'primary'
}

function getDialogType(dialog) {
  if (dialog.isChannel) return t('dialog.channel')
  if (dialog.isGroup) return t('dialog.group')
  return t('dialog.private')
}

function removeDownloadType(type) {
  const index = downloadTypes.value.indexOf(type)
  if (index > -1) {
    downloadTypes.value.splice(index, 1)
  }
}

// 选择下载目录
async function selectDownloadPath() {
  try {
    const { dialog } = await import('../utils/electronAPI.js')
    
    const result = await dialog.open({
      title: t('download.selectPath'),
      properties: ['openDirectory'],
      defaultPath: downloadPath.value || ''
    })

    if (!result.canceled && result.filePaths.length > 0) {
      downloadPath.value = result.filePaths[0]
    }
  } catch (error) {
    console.error('❌ 选择目录失败:', error)
    showError('选择目录失败: ' + error.message)
  }
}

// 重置表单
function resetForm() {
  downloadTypes.value = ['images', 'videos']
  startMessageId.value = ''
  endMessageId.value = ''
  // downloadPath.value = '' // 不重置下载路径
  filenameFilter.value = ''
  filterMode.value = 'include'
  minFileSize.value = null
  maxFileSize.value = null
  // 不重置选中的对话和下载记录
}

async function startDownload() {
  if (!selectedDialog.value || !formValid.value) {
    return
  }
  
  isDownloading.value = true
  showProgressDialog.value = true
  
  try {
    // 重置进度
    downloadProgress.value = {
      current: 0,
      total: 0,
      currentFile: '',
      status: t('download.progress.preparing'),
      downloaded: 0,
      skipped: 0,
      errors: 0,
      fileProgress: 0
    }
    
    // 创建下载配置
    const config = {
      dialog: selectedDialog.value,
      downloadTypes: downloadTypes.value,
      startMessageId: startMessageId.value ? parseInt(startMessageId.value) : null,
      endMessageId: endMessageId.value ? parseInt(endMessageId.value) : null,
      downloadPath: downloadPath.value,
      filenameFilter: filenameFilter.value?.trim() || null,
      filterMode: filterMode.value,
      minFileSize: minFileSize.value || null,
      maxFileSize: maxFileSize.value || null,
      onProgress: (progress) => {
        downloadProgress.value = { ...downloadProgress.value, ...progress }
      }
    }
    
    // 调用下载服务
    const result = await downloadService.downloadChannelContent(config)
    
    // 显示完成消息
    downloadProgress.value.status = `${t('download.progress.completed')}！${t('common.total')}${t('download.progress.processed')} ${result.totalMessages} ${t('download.progress.messages')}，${t('download.progress.downloaded')} ${result.downloaded} ${t('download.record.fileCount')}`
    
    // 刷新下载记录
    if (selectedDialog.value) {
      loadDownloadRecord(selectedDialog.value.id)
    }
    
  } catch (error) {
    console.error('❌ 下载失败:', error)
    downloadProgress.value.status = `${t('download.progress.failed')}: ${error.message}`
  } finally {
    isDownloading.value = false
  }
}

function cancelDownload() {
  if (isDownloadCompleted.value) {
    // 下载已完成，只需关闭对话框
    showProgressDialog.value = false
    console.log('✅ 关闭下载完成对话框')
  } else {
    // 下载进行中，取消下载
    downloadService.cancelDownload()
    isDownloading.value = false
    showProgressDialog.value = false
    
    // 刷新下载记录（如果有选中的对话）
    if (selectedDialog.value) {
      setTimeout(() => {
        loadDownloadRecord(selectedDialog.value.id)
      }, 1000) // 延迟一秒确保记录已保存
    }
    
    console.log('🛑 下载已取消')
  }
}

// 组件挂载时获取对话列表
onMounted(async () => {
  refreshDialogs()
  
  // 设置默认下载路径为系统下载目录
  if (!downloadPath.value) {
    try {
      const { systemPath } = await import('../utils/electronAPI.js')
      const downloadsPath = await systemPath.getDownloadsPath()
      downloadPath.value = downloadsPath
    } catch (error) {
      console.warn('⚠️ 获取下载目录失败，使用默认路径:', error)
      downloadPath.value = '/Downloads'
    }
  }
})
</script>

<style scoped>
/* 下载管理器容器 */
.download-manager {
  background: rgb(var(--v-theme-background));
  min-height: calc(100vh - 72px);
}

.manager-row {
  height: calc(100vh - 72px);
  gap: 16px;
  padding: 16px;
}

/* 响应式列布局 */
.sidebar-col, .main-col {
  padding: 8px;
}

@media (max-width: 960px) {
  .manager-row {
    height: auto;
    min-height: calc(100vh - 72px);
  }
  
  .sidebar-col {
    margin-bottom: 16px;
  }
}

/* 侧边栏卡片 */
.sidebar-card {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
}

.sidebar-header {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-primary-darken-1)) 100%);
  color: white;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.sidebar-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="1.5" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="30" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="30" cy="70" r="1.2" fill="rgba(255,255,255,0.1)"/></svg>');
  opacity: 0.4;
}

.header-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-avatar {
  background: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.header-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
}

.header-subtitle {
  font-size: 0.875rem;
  opacity: 0.85;
  margin: 4px 0 0;
  line-height: 1.2;
}

.refresh-btn {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 对话筛选器 */
.dialog-filter {
  background: rgba(var(--v-theme-surface), 0.5);
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.1);
}

.filter-options-btn {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.filter-options-btn:hover {
  opacity: 1;
}

.filter-menu {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.filter-info {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

/* 对话列表 */
.dialog-list {
  max-height: calc(100vh - 250px);
  overflow-y: auto;
}

.modern-list {
  background: transparent !important;
  padding: 16px !important;
}

.modern-dialog-item {
  border-radius: 16px !important;
  margin-bottom: 8px !important;
  padding: 16px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  background: rgba(var(--v-theme-surface), 0.8);
  backdrop-filter: blur(10px);
  border: 2px solid transparent;
}

.modern-dialog-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.modern-dialog-item.selected-dialog {
  background: rgba(var(--v-theme-primary), 0.1) !important;
  border-color: rgb(var(--v-theme-primary)) !important;
  box-shadow: 0 8px 25px rgba(var(--v-theme-primary), 0.2);
}

.dialog-avatar {
  margin-right: 16px !important;
}

.dialog-content {
  flex: 1;
  min-width: 0;
}

.dialog-title {
  font-weight: 600 !important;
  font-size: 1rem !important;
  line-height: 1.3 !important;
  margin-bottom: 4px !important;
}

.dialog-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-chip {
  font-weight: 500 !important;
  letter-spacing: 0.025em !important;
}

.dialog-id {
  font-size: 0.75rem;
  opacity: 0.7;
}

.selected-icon {
  animation: checkIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes checkIn {
  0% { 
    transform: scale(0) rotate(-45deg);
    opacity: 0;
  }
  100% { 
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-text {
  font-size: 1rem;
  color: rgb(var(--v-theme-on-surface-variant));
  margin: 0 0 16px;
}

/* 骨架加载 */
.skeleton-item {
  padding: 16px !important;
  margin-bottom: 8px !important;
}

.transparent-skeleton {
  background: transparent !important;
}

/* 主卡片 */
.main-card {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
}

.main-header {
  background: linear-gradient(135deg, rgb(var(--v-theme-secondary)) 0%, rgb(var(--v-theme-secondary-darken-1)) 100%);
  color: white;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.main-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="15" cy="25" r="1.2" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="35" r="0.8" fill="rgba(255,255,255,0.1)"/><circle cx="35" cy="75" r="1.5" fill="rgba(255,255,255,0.1)"/></svg>');
  opacity: 0.4;
}

.selected-chip {
  background: rgba(255, 255, 255, 0.9) !important;
  color: rgb(var(--v-theme-secondary)) !important;
  font-weight: 500;
}

/* 主内容区域 */
.main-content {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

/* 配置表单 */
.config-form {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.config-form.form-disabled {
  opacity: 0.6;
  pointer-events: none;
  filter: grayscale(0.2);
}

.form-section {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-section:hover {
  border-color: rgba(var(--v-theme-primary), 0.2);
  transform: translateY(-1px);
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
  display: flex;
  align-items: center;
}

/* 现代输入框 */
.modern-input .v-field,
.modern-select .v-field {
  background: rgb(var(--v-theme-surface)) !important;
  border: 2px solid transparent !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modern-input .v-field:hover,
.modern-select .v-field:hover {
  border-color: rgba(var(--v-theme-primary), 0.3) !important;
  transform: translateY(-1px);
}

.modern-input .v-field--focused,
.modern-select .v-field--focused {
  border-color: rgb(var(--v-theme-primary)) !important;
  box-shadow: 0 0 0 4px rgba(var(--v-theme-primary), 0.1) !important;
}

.path-input.v-text-field--readonly .v-field {
  cursor: pointer;
}

/* 下载类型项 */
.download-type-item {
  border-radius: 12px !important;
  margin: 4px 8px !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.download-type-item:hover {
  background: rgba(var(--v-theme-primary), 0.05) !important;
}

/* 警告框 */
.selected-alert,
.selection-prompt,
.path-info {
  border: none !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
}

.path-preview {
  background: rgba(var(--v-theme-primary), 0.1);
  padding: 12px 16px;
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
}

.folder-structure {
  display: grid;
  gap: 8px;
}

.structure-item {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface-variant));
}

.structure-sub-item {
  display: flex;
  align-items: center;
  margin-left: 20px;
  margin-top: 4px;
  margin-bottom: 8px;
  font-size: 0.8rem;
  color: rgb(var(--v-theme-on-surface-variant));
  opacity: 0.8;
}

/* 下载按钮区域 */
.download-buttons-section {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

/* 下载按钮 */
.download-btn {
  height: 64px !important;
  font-size: 1.125rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.025em !important;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-primary-darken-1)) 100%) !important;
  box-shadow: 0 8px 32px rgba(var(--v-theme-primary), 0.4) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.download-btn:hover:not(:disabled) {
  transform: translateY(-3px) !important;
  box-shadow: 0 12px 40px rgba(var(--v-theme-primary), 0.5) !important;
}

.download-btn:active {
  transform: translateY(-1px) !important;
}

/* 重置按钮 */
.reset-btn {
  height: 64px !important;
  min-width: 120px !important;
  font-weight: 600 !important;
  font-size: 1rem !important;
  box-shadow: 0 4px 16px rgba(255, 152, 0, 0.3) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  flex-shrink: 0;
}

.reset-btn:hover:not(:disabled) {
  transform: translateY(-3px) !important;
  box-shadow: 0 8px 24px rgba(255, 152, 0, 0.4) !important;
}

.reset-btn:active {
  transform: translateY(-1px) !important;
}

/* 进度对话框 */
.progress-card {
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(20px);
}

.progress-header {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-primary-darken-1)) 100%);
  color: white;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.progress-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="30" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="70" cy="20" r="0.8" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="80" r="1.2" fill="rgba(255,255,255,0.1)"/></svg>');
  opacity: 0.3;
}

.progress-section {
  background: rgba(var(--v-theme-surface-variant), 0.5);
  border-radius: 16px;
  padding: 20px;
}

.progress-label {
  font-weight: 600;
  font-size: 1rem;
}

.progress-count {
  font-weight: 500;
  color: rgb(var(--v-theme-primary));
}

.progress-bar {
  border-radius: 8px !important;
  overflow: hidden;
}

.status-section {
  padding: 16px 0;
}

.current-file {
  font-size: 1rem;
  display: flex;
  align-items: center;
}

.status-text {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface-variant));
  margin-left: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 1.5rem !important;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface-variant));
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* 暗色主题适配 */
.v-theme--dark .sidebar-card,
.v-theme--dark .main-card,
.v-theme--dark .progress-card {
  background: rgba(30, 41, 59, 0.95) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.v-theme--dark .modern-dialog-item {
  background: rgba(51, 65, 85, 0.8);
}

.v-theme--dark .form-section {
  background: rgba(51, 65, 85, 0.3);
}

/* 滚动条样式 */
.dialog-list::-webkit-scrollbar,
.main-content::-webkit-scrollbar {
  width: 6px;
}

.dialog-list::-webkit-scrollbar-track,
.main-content::-webkit-scrollbar-track {
  background: transparent;
}

.dialog-list::-webkit-scrollbar-thumb,
.main-content::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-on-surface-variant), 0.2);
  border-radius: 3px;
}

.dialog-list::-webkit-scrollbar-thumb:hover,
.main-content::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-on-surface-variant), 0.4);
}

/* 响应式布局 */
@media (max-width: 959px) {
  .manager-row {
    flex-direction: column !important;
  }
  
  .sidebar-col {
    max-width: 100% !important;
    flex-basis: 100% !important;
  }
  
  .main-col {
    max-width: 100% !important;
    flex-basis: 100% !important;
  }
  
  .sidebar-card,
  .main-card {
    min-height: auto !important;
  }
  
  .dialog-list {
    max-height: 400px;
  }
  
  .main-content {
    max-height: calc(100vh - 300px);
  }
  
  .stats-grid {
    grid-template-columns: 1fr !important;
  }
}

@media (min-width: 960px) {
  .manager-row {
    align-items: stretch !important;
  }
  
  .sidebar-col,
  .main-col {
    display: flex !important;
    flex-direction: column !important;
  }
  
  .sidebar-card,
  .main-card {
    flex: 1 !important;
    min-height: calc(100vh - 140px) !important;
  }
}

/* 强制列布局 */
.manager-row {
  min-height: calc(100vh - 120px);
}

.sidebar-col {
  padding-right: 8px !important;
}

.main-col {
  padding-left: 8px !important;
}

/* 桌面端固定宽度防止换行 */
@media (min-width: 960px) {
  .sidebar-col {
    flex: 0 0 40% !important;
    max-width: 40% !important;
  }
  
  .main-col {
    flex: 0 0 60% !important;
    max-width: 60% !important;
  }
  
  .manager-row {
    display: flex !important;
    flex-wrap: nowrap !important;
  }
}

@media (min-width: 1280px) {
  .sidebar-col {
    flex: 0 0 33.333333% !important;
    max-width: 33.333333% !important;
  }
  
  .main-col {
    flex: 0 0 66.666667% !important;
    max-width: 66.666667% !important;
  }
}

/* 下载记录样式 */
.download-record-alert {
  border: 1px solid rgba(var(--v-theme-success), 0.2) !important;
}

.downloaded-range-alert {
  border: 1px solid rgba(var(--v-theme-info), 0.2) !important;
}

.file-progress-section {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 12px;
  padding: 16px;
}

.file-progress-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
}

.file-progress-percent {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(var(--v-theme-secondary));
}

.file-progress-bar {
  border-radius: 6px !important;
}

.download-record-content {
  width: 100%;
}

.record-stats {
  margin-top: 16px;
}

.stat-row {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
}

.stat-row:last-child {
  margin-bottom: 0;
}

.stat-row .stat-item {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  padding: 8px 0;
  background: none;
  border-radius: 0;
}

.stat-row .stat-item:hover {
  transform: none;
  box-shadow: none;
}

.stat-label {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface-variant));
  margin-right: 4px;
}

.stat-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

@media (max-width: 768px) {
  .stat-row {
    flex-direction: column;
    gap: 8px;
  }
  
  .stat-row .stat-item {
    padding: 4px 0;
  }
}

/* 工具提示动画 */
.v-tooltip .v-overlay__content {
  background: rgba(0, 0, 0, 0.9) !important;
  backdrop-filter: blur(10px);
  border-radius: 8px !important;
  font-size: 0.75rem !important;
  padding: 8px 12px !important;
}

/* 过滤模式样式 */
.filter-mode-group {
  margin-top: 8px;
}

.filter-mode-group .v-radio {
  margin-right: 24px;
}

.filter-mode-group .v-selection-control__wrapper {
  height: auto;
}

.filter-mode-group .v-label {
  font-size: 0.875rem;
  font-weight: 500;
}

/* 关键字chips样式 */
.filter-keywords-section {
  padding: 12px 16px;
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
}

.filter-keywords-chips {
  gap: 8px;
}
</style>
