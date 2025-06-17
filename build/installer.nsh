; NSIS installer script for Telegram Channel Downloader

; 设置权限 - 不需要管理员权限
RequestExecutionLevel user

; 检查是否需要管理员权限
!macro preInit
  SetShellVarContext current
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "QuietUninstallString" "$\"$INSTDIR\uninstall.exe$\" /S"
!macroend

; 安装前检查
!macro customInstall
  ; 检查是否已安装旧版本
  ReadRegStr $0 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "UninstallString"
  ${If} $0 != ""
    MessageBox MB_YESNO|MB_ICONQUESTION "检测到已安装的版本，是否要先卸载？" IDNO +3
    ExecWait "$0 /S"
    Delete "$0"
  ${EndIf}
  
  ; 创建应用数据目录
  CreateDirectory "$APPDATA\telegram-channel-downloader"
  
  ; 设置文件关联
  WriteRegStr HKCU "Software\Classes\.tcd" "" "TelegramChannelDownloader"
  WriteRegStr HKCU "Software\Classes\TelegramChannelDownloader" "" "Telegram Channel Downloader File"
  WriteRegStr HKCU "Software\Classes\TelegramChannelDownloader\shell\open\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'
  
  ; 注册应用程序到系统
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "DisplayName" "${PRODUCT_NAME}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "DisplayVersion" "${PRODUCT_VERSION}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "Publisher" "oooooh_hooooo"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "DisplayIcon" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "InstallLocation" "$INSTDIR"
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "NoModify" 1
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "NoRepair" 1
  
  ; 注册应用程序到应用列表
  WriteRegStr HKCU "Software\RegisteredApplications" "TelegramChannelDownloader" "Software\TelegramChannelDownloader\Capabilities"
  WriteRegStr HKCU "Software\TelegramChannelDownloader\Capabilities" "ApplicationName" "${PRODUCT_NAME}"
  WriteRegStr HKCU "Software\TelegramChannelDownloader\Capabilities" "ApplicationDescription" "A powerful cross-platform Telegram channel content downloader"
!macroend

; 卸载时清理
!macro customUnInstall
  ; 清理注册表
  DeleteRegKey HKCU "Software\Classes\.tcd"
  DeleteRegKey HKCU "Software\Classes\TelegramChannelDownloader"
  
  ; 清理应用程序注册
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}"
  DeleteRegValue HKCU "Software\RegisteredApplications" "TelegramChannelDownloader"
  DeleteRegKey HKCU "Software\TelegramChannelDownloader"
  
  ; 清理开始菜单和桌面快捷方式
  Delete "$DESKTOP\${PRODUCT_NAME}.lnk"
  Delete "$SMPROGRAMS\${PRODUCT_NAME}.lnk"
  RMDir "$SMPROGRAMS\${PRODUCT_NAME}"
  
  ; 询问是否删除用户数据
  MessageBox MB_YESNO|MB_ICONQUESTION "是否删除用户数据和配置文件？" IDNO +3
  RMDir /r "$APPDATA\telegram-channel-downloader"
  RMDir /r "$LOCALAPPDATA\telegram-channel-downloader"
!macroend

; 初始化安装
!macro customInit
  ; 检查管理员权限（如果需要）
  ; UserInfo::GetAccountType
  ; Pop $0
  ; ${If} $0 != "admin"
  ;   MessageBox MB_ICONSTOP "需要管理员权限安装此应用程序"
  ;   SetErrorLevel 740 ; ERROR_ELEVATION_REQUIRED
  ;   Quit
  ; ${EndIf}
!macroend

; 设置安装选项
!macro customHeader
  !system "echo ; Custom NSIS script for Telegram Channel Downloader"
!macroend 