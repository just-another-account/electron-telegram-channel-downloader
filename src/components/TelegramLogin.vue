<template>
  <div class="login-wrapper">
    <v-container class="login-container">
      <v-row justify="center" align="center">
        <v-col cols="12" sm="11" md="9" lg="8" xl="6">
          <!-- 主登录卡片 -->
          <v-card 
            class="login-card glass-card"
            elevation="24"
            rounded="xl"
          >
            <!-- 卡片头部 -->
            <div class="card-header">
              <!-- 语言选择器 -->
              <div class="header-language-selector">
                <LanguageSelector />
              </div>
              <div class="header-content">
                <v-avatar class="logo-avatar" size="64">
                  <v-icon size="32" color="white">mdi-telegram</v-icon>
                </v-avatar>
                <h1 class="login-title">{{ $t('login.title') }}</h1>
                <p class="login-subtitle">{{ $t('login.subtitle') }}</p>
              </div>
              <div class="header-decoration"></div>
            </div>

            <v-card-text class="pa-6">
              <!-- 步骤指示器 -->
              <v-stepper 
                v-model="currentStepNumber" 
                class="modern-stepper mb-6"
                elevation="0"
                hide-actions
              >
                <v-stepper-header class="stepper-header">
                  <v-stepper-item 
                    :complete="currentStepNumber > 1"
                    :value="1"
                    class="stepper-item"
                  >
                    <template v-slot:icon>
                      <v-icon>mdi-key-variant</v-icon>
                    </template>
                    {{ $t('login.steps.apiConfig') }}
                  </v-stepper-item>
                  
                  <v-divider></v-divider>
                  
                  <v-stepper-item 
                    :complete="currentStepNumber > 2"
                    :value="2"
                    class="stepper-item"
                  >
                    <template v-slot:icon>
                      <v-icon>mdi-phone</v-icon>
                    </template>
                    {{ $t('login.steps.phoneVerification') }}
                  </v-stepper-item>
                  
                  <v-divider></v-divider>
                  
                  <v-stepper-item 
                    :complete="currentStepNumber > 3"
                    :value="3"
                    class="stepper-item"
                  >
                    <template v-slot:icon>
                      <v-icon>mdi-shield-check</v-icon>
                    </template>
                    {{ $t('login.steps.verificationCode') }}
                  </v-stepper-item>
                  
                  <v-divider></v-divider>
                  
                  <v-stepper-item 
                    :complete="currentStepNumber > 4"
                    :value="4"
                    class="stepper-item"
                  >
                    <template v-slot:icon>
                      <v-icon>mdi-lock</v-icon>
                    </template>
                    {{ $t('login.steps.twoStepVerification') }}
                  </v-stepper-item>
                </v-stepper-header>
              </v-stepper>

              <!-- API配置步骤 -->
              <v-window v-model="currentStepNumber" class="step-window">
                <v-window-item :value="1">
                  <div class="step-container">
                    <v-alert 
                      type="info" 
                      variant="tonal" 
                      class="mb-6 modern-alert"
                      rounded="lg"
                    >
                      <div class="d-flex align-center">
                        <v-icon class="me-3">mdi-information-outline</v-icon>
                        <div>
                          <div class="font-weight-medium">{{ $t('login.getApiCredentials') }}</div>
                          <div class="text-caption mt-1">
                            {{ $t('login.getApiCredentialsDescription') }} <a href="https://my.telegram.org" target="_blank" class="text-decoration-none">my.telegram.org</a>
                          </div>
                        </div>
                      </div>
                    </v-alert>
                    
                    <!-- 已保存凭据提示 -->
                    <v-alert 
                      v-if="telegramStore.hasStoredCredentials"
                      type="success" 
                      variant="tonal" 
                      class="mb-6 modern-alert"
                      rounded="lg"
                    >
                      <div class="d-flex align-center justify-space-between">
                        <div class="d-flex align-center">
                          <v-icon class="me-3">mdi-check-circle-outline</v-icon>
                          <div>
                            <div class="font-weight-medium">{{ $t('login.savedCredentials') }}</div>
                            <div class="text-caption mt-1">{{ $t('login.savedCredentialsDescription') }}</div>
                          </div>
                        </div>
                        <v-btn 
                          color="success" 
                          variant="tonal"
                          size="small"
                          @click="useStoredCredentials"
                          rounded="lg"
                        >
                          {{ $t('login.useSaved') }}
                        </v-btn>
                      </div>
                    </v-alert>
                    
                    <!-- 错误信息显示 -->
                    <v-alert 
                      v-if="errorMessage" 
                      type="error" 
                      variant="tonal" 
                      class="mb-6 modern-alert"
                      rounded="lg"
                    >
                      <div class="d-flex align-center">
                        <v-icon class="me-3">mdi-alert-circle-outline</v-icon>
                        <div>{{ errorMessage }}</div>
                      </div>
                    </v-alert>

                    <v-form ref="apiForm" v-model="apiFormValid" class="form-container">
                      <v-text-field
                        v-model="apiId"
                        label="API ID"
                        type="number"
                        variant="solo"
                        bg-color="surface-variant"
                        :rules="[v => !!v || $t('login.errors.apiIdRequired')]"
                        class="mb-4 modern-input"
                        prepend-inner-icon="mdi-identifier"
                        hide-details="auto"
                      ></v-text-field>
                      
                      <v-text-field
                        v-model="apiHash"
                        label="API Hash"
                        variant="solo"
                        bg-color="surface-variant"
                        :rules="[v => !!v || $t('login.errors.apiHashRequired')]"
                        class="mb-6 modern-input"
                        prepend-inner-icon="mdi-key-variant"
                        hide-details="auto"
                      ></v-text-field>
                      
                      <v-btn
                        color="primary"
                        size="large"
                        block
                        :disabled="!apiFormValid"
                        @click="setupAPI"
                        class="modern-btn"
                        rounded="xl"
                      >
                        <v-icon start>mdi-arrow-right</v-icon>
                        {{ $t('login.next') }}
                      </v-btn>
                      
                      <!-- 清除凭据按钮 -->
                      <v-btn
                        v-if="telegramStore.hasStoredCredentials"
                        variant="text"
                        color="error"
                        block
                        class="mt-4"
                        @click="clearStoredCredentials"
                        rounded="lg"
                      >
                        <v-icon start>mdi-delete-outline</v-icon>
                        {{ $t('login.clearSavedCredentials') }}
                      </v-btn>
                    </v-form>
                  </div>
                </v-window-item>

                <!-- 手机号输入步骤 -->
                <v-window-item :value="2">
                  <div class="step-container">
                    <v-alert 
                      type="info" 
                      variant="tonal" 
                      class="mb-6 modern-alert"
                      rounded="lg"
                    >
                      <div class="d-flex align-center">
                        <v-icon class="me-3">mdi-phone-outline</v-icon>
                        <div>
                          <div class="font-weight-medium">{{ $t('login.phoneVerification') }}</div>
                          <div class="text-caption mt-1">{{ $t('login.phoneVerificationDescription') }}</div>
                        </div>
                      </div>
                    </v-alert>
                    
                    <v-form ref="phoneForm" v-model="phoneFormValid" class="form-container">
                      <v-row class="mb-4">
                        <v-col cols="5">
                          <v-select
                            v-model="selectedCountry"
                            :items="countryList"
                            item-title="name"
                            item-value="code"
                            :label="$t('login.country')"
                            variant="solo"
                            bg-color="surface-variant"
                            :rules="[v => !!v || $t('login.selectCountry')]"
                            class="modern-input"
                            hide-details="auto"
                          >
                            <template v-slot:selection="{ item }">
                              <div class="d-flex align-center">
                                <span class="me-2">{{ item.raw.flag }}</span>
                                <span>{{ item.raw.code }}</span>
                              </div>
                            </template>
                            <template v-slot:item="{ item, props }">
                              <v-list-item v-bind="props" class="country-item">
                                <template v-slot:prepend>
                                  <span class="country-flag">{{ item.raw.flag }}</span>
                                </template>
                                <v-list-item-title>
                                  {{ item.raw.name }}
                                </v-list-item-title>
                                <v-list-item-subtitle>
                                  {{ item.raw.code }}
                                </v-list-item-subtitle>
                              </v-list-item>
                            </template>
                          </v-select>
                        </v-col>
                        <v-col cols="7">
                          <v-text-field
                            v-model="phoneNumberLocal"
                            :label="$t('login.phoneNumber')"
                            :placeholder="selectedCountryData?.placeholder || $t('login.phoneNumberPlaceholder')"
                            variant="solo"
                            bg-color="surface-variant"
                            :rules="phoneLocalRules"
                            type="tel"
                            class="modern-input"
                            prepend-inner-icon="mdi-phone"
                            hide-details="auto"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                      
                      <!-- 错误信息显示 -->
                      <v-alert 
                        v-if="errorMessage" 
                        type="error" 
                        variant="tonal" 
                        class="mb-6 modern-alert"
                        rounded="lg"
                      >
                        <div class="d-flex align-center">
                          <v-icon class="me-3">mdi-alert-circle-outline</v-icon>
                          <div>{{ errorMessage }}</div>
                        </div>
                      </v-alert>

                      <!-- 完整手机号显示 -->
                      <v-alert 
                        v-if="fullPhoneNumber" 
                        type="success" 
                        variant="tonal" 
                        class="mb-6 modern-alert"
                        rounded="lg"
                      >
                        <div class="d-flex align-center">
                          <div>
                            <div class="font-weight-medium">{{ $t('login.fullNumber') }}</div>
                            <div class="text-h6 mt-1">{{ fullPhoneNumber }}</div>
                          </div>
                        </div>
                      </v-alert>
                      
                      <v-btn
                        color="primary"
                        size="large"
                        block
                        :loading="sendingCode"
                        :disabled="!phoneFormValid || !fullPhoneNumber"
                        @click="sendCode"
                        class="modern-btn mb-4"
                        rounded="xl"
                      >
                        <v-icon start>mdi-send</v-icon>
                        {{ sendingCode ? $t('login.sending') : $t('login.sendCode') }}
                      </v-btn>
                      
                      <v-btn
                        variant="text"
                        block
                        @click="goBack"
                        rounded="lg"
                      >
                        <v-icon start>mdi-arrow-left</v-icon>
                        {{ $t('login.back') }}
                      </v-btn>
                      
                      <!-- Token登录选项 -->
                      <v-divider class="my-6"></v-divider>
                      
                      <div class="text-center">
                        <p class="text-caption text-medium-emphasis mb-4">
                          {{ $t('login.existingToken') }}
                        </p>
                        <v-btn
                          variant="outlined"
                          color="primary"
                          block
                          @click="showTokenDialog = true"
                          class="token-login-btn"
                          rounded="lg"
                        >
                          <v-icon start>mdi-key-outline</v-icon>
                          {{ $t('login.useTokenLogin') }}
                        </v-btn>
                      </div>
                    </v-form>
                  </div>
                </v-window-item>

                <!-- 验证码输入步骤 -->
                <v-window-item :value="3">
                  <div class="step-container">
                    <v-alert 
                      type="success" 
                      variant="tonal" 
                      class="mb-6 modern-alert"
                      rounded="lg"
                    >
                      <div class="d-flex align-center">
                        <v-icon class="me-3">mdi-message-text-outline</v-icon>
                        <div>
                          <div class="font-weight-medium">{{ $t('login.verificationCodeSent') }}</div>
                          <div class="text-caption mt-1">{{ $t('login.verificationCodeSentDescription') }} {{ fullPhoneNumber || phoneNumber }}</div>
                        </div>
                      </div>
                    </v-alert>

                    <!-- 错误信息显示 -->
                    <v-alert 
                      v-if="errorMessage" 
                      type="error" 
                      variant="tonal" 
                      class="mb-6 modern-alert"
                      rounded="lg"
                    >
                      <div class="d-flex align-center">
                        <v-icon class="me-3">mdi-alert-circle-outline</v-icon>
                        <div>{{ errorMessage }}</div>
                      </div>
                    </v-alert>
                    
                    <v-form ref="codeForm" v-model="codeFormValid" class="form-container">
                      <v-text-field
                        v-model="verificationCode"
                        :label="$t('login.verificationCode')"
                        :placeholder="$t('login.enterVerificationCode')"
                        variant="solo"
                        bg-color="surface-variant"
                        :rules="codeRules.value"
                        class="mb-6 modern-input verification-input"
                        prepend-inner-icon="mdi-shield-key-outline"
                        hide-details="auto"
                        @keyup.enter="verifyCode"
                      ></v-text-field>
                      
                      <v-btn
                        color="primary"
                        size="large"
                        block
                        :loading="verifying"
                        :disabled="!codeFormValid"
                        @click="verifyCode"
                        class="modern-btn mb-4"
                        rounded="xl"
                      >
                        <v-icon start>mdi-check-circle</v-icon>
                        {{ verifying ? '验证中...' : '完成登录' }}
                      </v-btn>

                      <!-- 重新发送验证码 -->
                      <div class="text-center mb-4">
                        <v-btn
                          v-if="resendCountdown <= 0"
                          variant="outlined"
                          color="primary"
                          :loading="sendingCode"
                          @click="resendCode"
                          rounded="lg"
                        >
                          <v-icon start>mdi-refresh</v-icon>
                          {{ $t('login.resendCode') }}
                        </v-btn>
                        <v-chip
                          v-else
                          variant="tonal"
                          color="primary"
                          class="resend-countdown"
                        >
                          <v-icon start>mdi-timer-outline</v-icon>
                          {{ resendCountdown }} {{ $t('login.secondsUntilResend') }}
                        </v-chip>
                      </div>
                      
                      <v-btn
                        variant="text"
                        block
                        @click="goBack"
                        rounded="lg"
                      >
                        <v-icon start>mdi-arrow-left</v-icon>
                        {{ $t('login.back') }}
                      </v-btn>
                    </v-form>
                  </div>
                </v-window-item>

                <!-- 两步验证密码输入步骤 -->
                <v-window-item :value="4">
                  <div class="step-container">
                    <v-alert 
                      type="warning" 
                      variant="tonal" 
                      class="mb-6 modern-alert"
                      rounded="lg"
                    >
                      <div class="d-flex align-center">
                        <v-icon class="me-3">mdi-lock-outline</v-icon>
                        <div>
                          <div class="font-weight-medium">{{ $t('login.twoStepRequired') }}</div>
                          <div class="text-caption mt-1">{{ $t('login.twoStepRequiredDescription') }}</div>
                        </div>
                      </div>
                    </v-alert>

                    <!-- 错误信息显示 -->
                    <v-alert 
                      v-if="errorMessage" 
                      type="error" 
                      variant="tonal" 
                      class="mb-6 modern-alert"
                      rounded="lg"
                    >
                      <div class="d-flex align-center">
                        <v-icon class="me-3">mdi-alert-circle-outline</v-icon>
                        <div>{{ errorMessage }}</div>
                      </div>
                    </v-alert>
                    
                    <v-form ref="passwordForm" v-model="passwordFormValid" class="form-container">
                      <v-text-field
                        v-model="password"
                        :label="$t('login.password')"
                        type="password"
                        :placeholder="$t('login.enterTwoStepPassword')"
                        variant="solo"
                        bg-color="surface-variant"
                        :rules="[v => !!v || $t('login.errors.passwordRequired')]"
                        class="mb-6 modern-input"
                        prepend-inner-icon="mdi-lock"
                        hide-details="auto"
                        @keyup.enter="verifyPassword"
                      ></v-text-field>
                      
                      <v-btn
                        color="primary"
                        size="large"
                        block
                        :loading="verifying"
                        :disabled="!passwordFormValid"
                        @click="verifyPassword"
                        class="modern-btn mb-4"
                        rounded="xl"
                      >
                        <v-icon start>mdi-check-circle</v-icon>
                        {{ verifying ? $t('common.loading') : $t('login.verify') }}
                      </v-btn>
                      
                      <v-btn
                        variant="text"
                        block
                        @click="goBack"
                        rounded="lg"
                      >
                        <v-icon start>mdi-arrow-left</v-icon>
                        {{ $t('login.back') }}
                      </v-btn>
                    </v-form>                  </div>
                </v-window-item>
              </v-window>
            </v-card-text>

            <!-- 项目信息和链接 -->
            <v-card-actions class="px-6 pb-6">
              <v-container class="pa-0">
                <v-divider class="mb-4"></v-divider>
                <div class="project-links">
                  <div class="links-title">
                    <v-icon size="16" color="primary" class="mr-2">mdi-information-outline</v-icon>
                    <span class="text-caption text-medium-emphasis">{{ $t('common.projectInfo') }}</span>
                  </div>
                  <div class="links-container">
                    <v-btn
                      variant="text"
                      size="small"
                      color="primary"
                      :href="'https://github.com/just-another-account/electron-telegram-channel-downloader'"
                      target="_blank"
                      class="link-btn"
                    >
                      <v-icon start size="16">mdi-github</v-icon>
                      GitHub
                    </v-btn>
                    <v-btn
                      variant="text"
                      size="small"
                      color="primary"
                      :href="'https://t.me/oooooh_hooooo'"
                      target="_blank"
                      class="link-btn"
                    >
                      <v-icon start size="16">mdi-send</v-icon>
                      {{ $t('common.developer') }}
                    </v-btn>
                    <v-btn
                      variant="text"
                      size="small"
                      color="primary"
                      :href="'https://t.me/channel_downloader_chat'"
                      target="_blank"
                      class="link-btn"
                    >
                      <v-icon start size="16">mdi-chat</v-icon>
                      {{ $t('common.support') }}
                    </v-btn>
                  </div>
                </div>
              </v-container>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Token登录对话框 -->
    <v-dialog 
      v-model="showTokenDialog" 
      max-width="600" 
      persistent
      class="token-dialog"
    >
      <v-card class="token-card" rounded="xl" elevation="24">
        <v-card-title class="token-dialog-header">
          <div class="d-flex align-center">
            <v-avatar class="me-3" size="40" color="primary">
              <v-icon color="white">mdi-key-variant</v-icon>
            </v-avatar>
            <div>
              <h3 class="text-h6 mb-1">{{ $t('login.tokenLogin') }}</h3>
              <p class="text-caption text-medium-emphasis mb-0">
                {{ $t('login.tokenLoginDescription') }}
              </p>
            </div>
          </div>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-alert 
            type="info" 
            variant="tonal" 
            class="mb-6"
            rounded="lg"
          >
            <div class="d-flex align-center">
              <v-icon class="me-3">mdi-information-outline</v-icon>
              <div>
                <div class="font-weight-medium">{{ $t('login.whatIsToken') }}</div>
                <div class="text-caption mt-1">
                  {{ $t('login.tokenExplanation') }}
                </div>
              </div>
            </div>
          </v-alert>

          <v-form ref="tokenForm" v-model="tokenFormValid">
            <v-textarea
              v-model="sessionToken"
              :label="$t('login.sessionToken')"
              :placeholder="$t('login.pasteToken')"
              variant="solo"
              bg-color="surface-variant"
              :rules="tokenRules"
              rows="4"
              auto-grow
              class="mb-4 modern-input"
              prepend-inner-icon="mdi-key-variant"
              hide-details="auto"
            ></v-textarea>

            <!-- 错误信息 -->
            <v-alert 
              v-if="tokenErrorMessage" 
              type="error" 
              variant="tonal" 
              class="mb-4"
              rounded="lg"
            >
              {{ tokenErrorMessage }}
            </v-alert>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-btn
            variant="text"
            @click="closeTokenDialog"
            rounded="lg"
          >
            {{ $t('common.cancel') }}
          </v-btn>
          
          <v-spacer></v-spacer>
          
          <v-btn
            color="primary"
            :loading="tokenLogging"
            :disabled="!tokenFormValid"
            @click="loginWithToken"
            rounded="lg"
            size="large"
          >
            <v-icon start>mdi-login</v-icon>
            {{ tokenLogging ? $t('common.loading') : $t('login.connect') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
/* 通用样式 */
* {
  box-sizing: border-box;
}
/* 登录包装器 */
.login-wrapper {
  position: relative;
  min-height: 100vh;
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  overflow: hidden;
}

.login-container {
  height: 100vh;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 20px 24px !important;
  max-width: 100% !important;
  overflow: hidden !important;
  width: 100% !important;
}

/* 玻璃拟态卡片 */
.glass-card {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 8px 32px rgba(0, 0, 0, 0.05) !important;
}

/* 卡片头部 */
.card-header {
  position: relative;
  background: linear-gradient(135deg, rgb(var(--v-theme-gradient-start)) 0%, rgb(var(--v-theme-gradient-end)) 100%);
  color: white;
  padding: 40px 32px 32px;
  text-align: center;
  overflow: hidden;
}

/* 语言选择器定位 */
.header-language-selector {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
}

.card-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="40" r="1.5" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="80" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="90" r="2.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="1.5" fill="rgba(255,255,255,0.1)"/></svg>');
  opacity: 0.3;
}

.header-content {
  position: relative;
  z-index: 1;
}

.logo-avatar {
  background: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  margin-bottom: 16px;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 16px 0 8px;
  letter-spacing: -0.025em;
}

.login-subtitle {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 400;
}

.header-decoration {
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 20px;
  background: white;
  border-radius: 20px 20px 0 0;
}

/* 现代步骤指示器 */
.modern-stepper {
  background: transparent !important;
  box-shadow: none !important;
}

.stepper-header {
  padding: 0 !important;
  background: rgb(var(--v-theme-surface-variant)) !important;
  border-radius: 16px;
  padding: 8px !important;
}

.stepper-item {
  border-radius: 12px !important;
}

/* 步骤窗口 */
.step-window {
  min-height: auto;
}

.step-container {
  padding: 8px 0;
}

/* 现代提示框 */
.modern-alert {
  border: none !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
}

/* 现代输入框 */
.modern-input .v-field {
  border-radius: 16px !important;
  background: rgb(var(--v-theme-surface-variant)) !important;
  border: 2px solid transparent !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modern-input .v-field:hover {
  border-color: rgba(var(--v-theme-primary), 0.3) !important;
  transform: translateY(-1px);
}

.modern-input .v-field--focused {
  border-color: rgb(var(--v-theme-primary)) !important;
  box-shadow: 0 0 0 4px rgba(var(--v-theme-primary), 0.1) !important;
}

.modern-input .v-field__input {
  font-size: 1rem;
  padding: 16px !important;
  min-height: 56px;
}

/* 验证码输入特殊样式 */
.verification-input .v-field__input {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.5em;
  padding-left: 1em !important;
}

/* 现代按钮 */
.modern-btn {
  height: 56px !important;
  font-size: 1rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.025em !important;
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.3) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.modern-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 12px 32px rgba(var(--v-theme-primary), 0.4) !important;
}

.modern-btn:active {
  transform: translateY(0) !important;
}

/* 国家选择项 */
.country-item {
  padding: 12px 16px !important;
  border-radius: 8px !important;
  margin: 4px 8px !important;
}

.country-flag {
  font-size: 1.25rem;
  margin-right: 12px;
}

/* 表单容器 */
.form-container {
  padding: 0 4px;
  width: 100%;
  box-sizing: border-box;
}

/* 输入框间距优化 */
.modern-input {
  margin-bottom: 20px !important;
}

.modern-input .v-field {
  padding: 4px 16px !important;
  min-height: 56px !important;
}

.step-container {
  padding: 8px 0;
  min-height: auto;
}

/* 登录卡片尺寸优化 */
.login-card {
  width: 100% !important;
  min-width: 320px !important;
  max-width: 600px !important;
  margin: 0 auto !important;
  max-height: 90vh !important;
  overflow-y: auto !important;
}

/* 响应式设计 */
@media (min-width: 960px) {
  .login-container {
    padding: 40px 32px !important;
  }
  
  .login-card {
    max-width: 600px !important;
  }
}

@media (min-width: 1264px) {
  .login-container {
    padding: 40px 64px !important;
  }
  
  .login-card {
    max-width: 650px !important;
  }
}

@media (max-width: 960px) {
  .login-container {
    padding: 20px 24px !important;
    height: 100vh;
    overflow: hidden;
  }
  
  .login-card {
    max-width: 500px !important;
    max-height: 90vh;
    overflow-y: auto;
  }
}

@media (max-width: 600px) {
  .login-container {
    padding: 16px 12px !important;
    height: 100vh;
    overflow: hidden;
  }
  
  .login-card {
    max-height: 95vh;
    overflow-y: auto;
  }
  
  .card-header {
    padding: 32px 24px 24px;
  }
  
  .login-title {
    font-size: 1.75rem;
  }
  
  .v-card-text {
    padding: 24px !important;
  }
  
  .modern-btn {
    height: 52px !important;
  }
  
  .login-card {
    margin: 16px !important;
    width: calc(100% - 32px) !important;
    min-width: 280px !important;
    max-width: calc(100% - 32px) !important;
    max-height: 90vh !important;
  }
  
  .login-container {
    padding: 20px 16px !important;
    height: auto !important;
    min-height: 100vh !important;
  }
}

@media (min-width: 601px) {
  .login-card {
    min-width: 400px !important;
    max-width: 500px !important;
    margin: 0 auto !important;
  }
}

@media (min-width: 960px) {
  .login-card {
    min-width: 450px !important;
    max-width: 550px !important;
  }
}

@media (min-width: 1280px) {
  .login-card {
    min-width: 480px !important;
    max-width: 600px !important;
  }
}

/* 暗色主题适配 */
.v-theme--dark .glass-card {
  background: rgba(30, 41, 59, 0.95) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.v-theme--dark .header-decoration {
  background: rgb(var(--v-theme-surface));
}

/* 动画效果 */
.v-window-item {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-stepper-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 加载状态优化 */
.v-btn--loading {
  pointer-events: none;
}

.v-btn--loading .v-btn__content {
  opacity: 0.7;
}

/* Token登录按钮样式 */
.token-login-btn {
  border: 2px solid rgb(var(--v-theme-primary)) !important;
  color: rgb(var(--v-theme-primary)) !important;
  background: rgba(255, 255, 255, 0.9) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.token-login-btn:hover {
  background: rgb(var(--v-theme-primary)) !important;
  color: white !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.3) !important;
}

.token-login-btn .v-icon {
  color: inherit !important;
}

/* Token对话框样式 */
.token-dialog .v-overlay__content {
  margin: 24px;
}

.token-card {
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.token-dialog-header {
  background: linear-gradient(135deg, rgb(var(--v-theme-gradient-start)) 0%, rgb(var(--v-theme-gradient-end)) 100%);
  color: white;
  padding: 24px !important;
  border-radius: 12px 12px 0 0 !important;
}

.v-theme--dark .token-card {
  background: rgba(30, 41, 59, 0.98) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 暗色主题下的 Token 登录按钮 */
.v-theme--dark .token-login-btn {
  background: rgba(30, 41, 59, 0.9) !important;
  border: 2px solid rgb(var(--v-theme-primary)) !important;
  color: rgb(var(--v-theme-primary)) !important;
}

.v-theme--dark .token-login-btn:hover {
  background: rgb(var(--v-theme-primary)) !important;
  color: white !important;
}

/* 项目链接样式 */
.project-links {
  text-align: center;
}

.links-title {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  opacity: 0.8;
}

.links-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.link-btn {
  text-transform: none !important;
  font-size: 0.75rem !important;
  height: 32px !important;
  padding: 0 12px !important;
  border-radius: 16px !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.link-btn:hover {
  background: rgba(var(--v-theme-primary-rgb), 0.1) !important;
  transform: translateY(-1px);
}

.v-theme--dark .link-btn:hover {
  background: rgba(var(--v-theme-primary-rgb), 0.2) !important;
}

/* 响应式设计 */
@media (max-width: 600px) {
  .links-container {
    flex-direction: column;
    gap: 4px;
  }
  
  .link-btn {
    width: 100%;
    max-width: 200px;
  }
}

/* 针对较短屏幕的优化 */
@media (max-height: 700px) {
  .login-wrapper,
  .login-container {
    min-height: 100vh;
    height: 100vh;
    overflow: hidden;
  }
  
  .login-card {
    max-height: 95vh;
    overflow-y: auto;
  }
  
  .card-header {
    padding: 24px 32px 20px;
  }
  
  .v-card-text {
    padding: 16px 24px !important;
  }
}

@media (max-height: 600px) {
  .card-header {
    padding: 16px 24px 12px;
  }
  
  .login-title {
    font-size: 1.5rem;
    margin-bottom: 4px;
  }
  
  .login-subtitle {
    font-size: 0.875rem;
  }
  
  .logo-avatar {
    margin-bottom: 8px !important;
  }
}
</style>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTelegramStore } from '../stores/telegram'
import LanguageSelector from './LanguageSelector.vue'

const { t } = useI18n()

const telegramStore = useTelegramStore()

// 表单引用
const apiForm = ref(null)
const phoneForm = ref(null)
const codeForm = ref(null)
const passwordForm = ref(null)

// 表单验证状态
const apiFormValid = ref(false)
const phoneFormValid = ref(false)
const codeFormValid = ref(false)
const passwordFormValid = ref(false)

// 当前步骤
const currentStepNumber = ref(1)

// 表单数据
const apiId = ref('')
const apiHash = ref('')
const phoneNumber = ref('')
const phoneNumberLocal = ref('')
const selectedCountry = ref('+86')
const verificationCode = ref('')
const password = ref('')

// 国家码列表
const countryList = ref([
  { name: '中国', code: '+86', flag: '🇨🇳', placeholder: '138 0013 8000' },
  { name: '美国', code: '+1', flag: '🇺🇸', placeholder: '201 555 0123' },
  { name: '英国', code: '+44', flag: '🇬🇧', placeholder: '7700 900123' },
  { name: '日本', code: '+81', flag: '🇯🇵', placeholder: '90 1234 5678' },
  { name: '韩国', code: '+82', flag: '🇰🇷', placeholder: '10 1234 5678' },
  { name: '新加坡', code: '+65', flag: '🇸🇬', placeholder: '8123 4567' },
  { name: '香港', code: '+852', flag: '🇭🇰', placeholder: '5123 4567' },
  { name: '台湾', code: '+886', flag: '🇹🇼', placeholder: '912 345678' },
  { name: '澳大利亚', code: '+61', flag: '🇦🇺', placeholder: '412 345 678' },
  { name: '加拿大', code: '+1', flag: '🇨🇦', placeholder: '204 123 4567' },
  { name: '德国', code: '+49', flag: '🇩🇪', placeholder: '151 12345678' },
  { name: '法国', code: '+33', flag: '🇫🇷', placeholder: '6 12 34 56 78' },
  { name: '意大利', code: '+39', flag: '🇮🇹', placeholder: '320 123 4567' },
  { name: '西班牙', code: '+34', flag: '🇪🇸', placeholder: '612 34 56 78' },
  { name: '俄罗斯', code: '+7', flag: '🇷🇺', placeholder: '912 123 45 67' },
  { name: '印度', code: '+91', flag: '🇮🇳', placeholder: '81234 56789' },
  { name: '泰国', code: '+66', flag: '🇹🇭', placeholder: '81 234 5678' },
  { name: '马来西亚', code: '+60', flag: '🇲🇾', placeholder: '12 345 6789' },
  { name: '印度尼西亚', code: '+62', flag: '🇮🇩', placeholder: '812 3456 789' },
  { name: '菲律宾', code: '+63', flag: '🇵🇭', placeholder: '917 123 4567' },
  { name: '越南', code: '+84', flag: '🇻🇳', placeholder: '91 234 56 78' },
  { name: '巴西', code: '+55', flag: '🇧🇷', placeholder: '11 91234 5678' },
  { name: '墨西哥', code: '+52', flag: '🇲🇽', placeholder: '55 1234 5678' },
  { name: '阿根廷', code: '+54', flag: '🇦🇷', placeholder: '11 1234 5678' },
  { name: '土耳其', code: '+90', flag: '🇹🇷', placeholder: '532 123 45 67' },
  { name: '以色列', code: '+972', flag: '🇮🇱', placeholder: '50 123 4567' },
  { name: '阿联酋', code: '+971', flag: '🇦🇪', placeholder: '50 123 4567' },
  { name: '沙特阿拉伯', code: '+966', flag: '🇸🇦', placeholder: '50 123 4567' },
  { name: '埃及', code: '+20', flag: '🇪🇬', placeholder: '100 123 4567' },
  { name: '南非', code: '+27', flag: '🇿🇦', placeholder: '82 123 4567' }
])

// 状态
const sendingCode = ref(false)
const verifying = ref(false)
const errorMessage = ref('')

// 重新发送倒计时
const resendCountdown = ref(0)
const resendTimer = ref(null)

// Token登录相关状态
const showTokenDialog = ref(false)
const sessionToken = ref('')
const tokenFormValid = ref(false)
const tokenLogging = ref(false)
const tokenErrorMessage = ref('')

// 计算属性
const resendDisabled = computed(() => resendCountdown.value > 0)

// 选中的国家数据
const selectedCountryData = computed(() => {
  return countryList.value.find(country => country.code === selectedCountry.value)
})

// 完整手机号
const fullPhoneNumber = computed(() => {
  if (selectedCountry.value && phoneNumberLocal.value) {
    // 清理本地号码（移除空格和特殊字符）
    const cleanLocal = phoneNumberLocal.value.replace(/\s+/g, '').replace(/[^\d]/g, '')
    if (cleanLocal) {
      return `${selectedCountry.value}${cleanLocal}`
    }
  }
  return ''
})

// 验证规则
const phoneLocalRules = [
  v => !!v || '手机号码是必填项',
  v => {
    const cleaned = v.replace(/\s+/g, '').replace(/[^\d]/g, '')
    return cleaned.length >= 7 && cleaned.length <= 15 || '请输入有效的手机号码'
  }
]

const codeRules = computed(() => [
  v => !!v || t('login.errors.codeRequired'),
  v => /^\d{4,6}$/.test(v) || t('login.errors.codeInvalid')
])

const tokenRules = [
  v => !!v || 'Token是必填项',
  v => v.length > 10 || 'Token长度应大于10个字符',
  v => !/\s/.test(v) || 'Token不应包含空格'
]

// 方法
// 使用已保存的凭据
function useStoredCredentials() {
  if (telegramStore.hasStoredCredentials) {
    apiId.value = telegramStore.apiCredentials.apiId.toString()
    apiHash.value = telegramStore.apiCredentials.apiHash
    // 自动进行下一步
    setupAPI()
  }
}

// 清除保存的凭据
function clearStoredCredentials() {
  telegramStore.clearStoredCredentials()
  apiId.value = ''
  apiHash.value = ''
  errorMessage.value = ''
}

async function setupAPI() {
  try {
    await telegramStore.initializeClient(apiId.value, apiHash.value)
    currentStepNumber.value = 2
  } catch (error) {
    errorMessage.value = '初始化客户端失败: ' + error.message
  }
}

async function sendCode() {
  sendingCode.value = true
  errorMessage.value = ''
  
  try {
    // 使用带+号的完整手机号（GramJS 需要）
    const phoneForApi = fullPhoneNumber.value
    console.log('📱 准备发送验证码到:', phoneForApi);
    
    if (phoneForApi.length < 10) {
      errorMessage.value = '请输入有效的完整手机号';
      sendingCode.value = false;
      return;
    }
    
    phoneNumber.value = phoneForApi
    const result = await telegramStore.sendCode(phoneForApi)
    console.log('✅ 发送验证码结果:', result)
    
    currentStepNumber.value = 3
    startResendCountdown()
  } catch (error) {
    console.error('❌ 发送验证码失败:', error)
    errorMessage.value = t('login.errors.sendCodeFailed') + (error.message || error)
  } finally {
    sendingCode.value = false
  }
}

async function verifyCode() {
  verifying.value = true
  errorMessage.value = ''
  
  try {
    const result = await telegramStore.signIn(phoneNumber.value, verificationCode.value)
    
    if (result.needPassword) {
      currentStepNumber.value = 4
    } else if (result.success) {
      // 登录成功，触发事件
      emit('loginSuccess')
    } else {
      errorMessage.value = '登录失败，请重试'
    }
  } catch (error) {
    console.error('验证码验证失败:', error)
    if (error.message.includes('PHONE_CODE_INVALID')) {
      errorMessage.value = t('login.errors.codeInvalidRetry')
    } else if (error.message.includes('PHONE_CODE_EXPIRED')) {
      errorMessage.value = t('login.errors.codeExpired')
    } else if (error.message.includes('SESSION_PASSWORD_NEEDED')) {
      currentStepNumber.value = 4
      return
    } else {
      errorMessage.value = '验证失败: ' + (error.message || '未知错误')
    }
  } finally {
    verifying.value = false
  }
}

async function verifyPassword() {
  verifying.value = true
  errorMessage.value = ''
  
  try {
    const result = await telegramStore.signInWithPassword(password.value)
    if (result) {
      // 登录成功，触发事件
      emit('loginSuccess')
    }
  } catch (error) {
    console.error('密码验证失败:', error)
    if (error.message.includes('PASSWORD_HASH_INVALID')) {
      errorMessage.value = '密码错误，请重试'
    } else {
      errorMessage.value = '密码验证失败: ' + (error.message || '未知错误')
    }
  } finally {
    verifying.value = false
  }
}

async function resendCode() {
  if (resendDisabled.value) return
  
  sendingCode.value = true
  errorMessage.value = ''
  
  try {
    // 使用带+号的完整手机号
    await telegramStore.sendCode(phoneNumber.value || fullPhoneNumber.value)
    startResendCountdown()
  } catch (error) {
    errorMessage.value = t('login.errors.resendCodeFailed') + error.message
  } finally {
    sendingCode.value = false
  }
}

function goBack() {
  if (currentStepNumber.value === 2) {
    currentStepNumber.value = 1
  } else if (currentStepNumber.value === 3) {
    currentStepNumber.value = 2
  } else if (currentStepNumber.value === 4) {
    currentStepNumber.value = 3
  }
  errorMessage.value = ''
}

function startResendCountdown() {
  resendCountdown.value = 60
  resendTimer.value = setInterval(() => {
    resendCountdown.value--
    if (resendCountdown.value <= 0) {
      clearInterval(resendTimer.value)
    }
  }, 1000)
}

// Token登录相关方法
async function loginWithToken() {
  tokenLogging.value = true
  tokenErrorMessage.value = ''
  
  try {
    const result = await telegramStore.signInWithToken(sessionToken.value.trim())
    
    if (result.success) {
      // 保存token到本地存储
      telegramStore.saveToken(sessionToken.value.trim())
      
      // 关闭对话框
      closeTokenDialog()
      
      // 触发登录成功事件
      emit('loginSuccess')
    } else {
      tokenErrorMessage.value = 'Token登录失败，请检查Token是否正确'
    }
  } catch (error) {
    console.error('Token登录失败:', error)
    if (error.message.includes('无效') || error.message.includes('过期')) {
      tokenErrorMessage.value = '提供的Token无效或已过期，请检查后重试'
    } else {
      tokenErrorMessage.value = 'Token登录失败: ' + (error.message || '未知错误')
    }
  } finally {
    tokenLogging.value = false
  }
}

function closeTokenDialog() {
  showTokenDialog.value = false
  sessionToken.value = ''
  tokenErrorMessage.value = ''
  tokenFormValid.value = false
}

// 事件定义
const emit = defineEmits(['loginSuccess'])

// 组件卸载时清理定时器
onUnmounted(() => {
  if (resendTimer.value) {
    clearInterval(resendTimer.value)
  }
})

// 组件挂载时检查是否已经登录和加载保存的凭据
onMounted(() => {
  // 检查是否已经登录
  if (telegramStore.isLoggedIn) {
    emit('loginSuccess')
    return
  }
  
  // 加载保存的API凭据
  if (telegramStore.loadStoredCredentials()) {
    apiId.value = telegramStore.apiCredentials.apiId.toString()
    apiHash.value = telegramStore.apiCredentials.apiHash
    console.log('已自动加载保存的API凭据')
  }
})
</script>
