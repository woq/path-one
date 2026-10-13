; path-one NSIS Custom Installer Script
; Seamlessly handles Windows Service lifecycle during version updates

!macro preInit
  ; Per-machine install. Do not reuse an old per-user directory under LocalAppData.
  ReadRegStr $0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\150a135a-af77-530d-b015-221cc51f7831" "InstallLocation"
  ${If} $0 != ""
  ${AndIf} ${FileExists} "$0\path-one.exe"
    StrCpy $INSTDIR $0
  ${Else}
    ${If} ${FileExists} "$PROGRAMFILES64\path-one\path-one.exe"
      StrCpy $INSTDIR "$PROGRAMFILES64\path-one"
    ${ElseIf} ${FileExists} "$PROGRAMFILES\path-one\path-one.exe"
      StrCpy $INSTDIR "$PROGRAMFILES\path-one"
    ${EndIf}
  ${EndIf}
!macroend

!macro customInit
  ; Stop our service first so it can stop its own core child. Do not kill every core.exe on the machine.
  nsExec::Exec 'cmd.exe /c "sc.exe stop PathOneService & taskkill /F /IM path-one.exe /T 2>nul"'
!macroend

!macro customInstall
  ; Writable data stays under the install directory. Users can modify only this folder.
  CreateDirectory "$INSTDIR\data"
  CreateDirectory "$INSTDIR\data\logs"
  nsExec::Exec 'icacls.exe "$INSTDIR\data" /grant *S-1-5-32-545:(OI)(CI)M /T'
  ; The installer runs elevated and installs under Program Files, so service registration is part of setup.
  nsExec::Exec 'sc.exe create PathOneService binPath= "$INSTDIR\resources\binaries\PathOneService.exe" start= auto DisplayName= "Path One Core Proxy Service"'
  nsExec::Exec 'sc.exe description PathOneService "Path One starts the core at boot and the tray at user logon"'
  nsExec::Exec 'sc.exe config PathOneService binPath= "$INSTDIR\resources\binaries\PathOneService.exe" start= auto'
  nsExec::Exec 'sc.exe start PathOneService'
  ; Interactive logon entry. This runs on the user desktop, which is what the tray needs.
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "path-one" '"$INSTDIR\path-one.exe" --silent'
  ; Leave PathOne_AutoStart in place. The app deletes only a highest-privilege task that is not interactive.
!macroend

!macro customUnInit
  ; Stop and delete service cleanly during complete uninstall
  nsExec::Exec 'cmd.exe /c "sc.exe stop PathOneService 2>nul"'
  nsExec::Exec 'cmd.exe /c "sc.exe delete PathOneService 2>nul"'
  nsExec::Exec 'cmd.exe /c "taskkill /F /IM path-one.exe /T 2>nul"'
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "path-one"
  nsExec::Exec 'schtasks.exe /Delete /TN "PathOne_AutoStart" /F 2>nul'
  nsExec::Exec 'netsh.exe advfirewall firewall delete rule name=PathOne_App'
  nsExec::Exec 'netsh.exe advfirewall firewall delete rule name=PathOne_Core'
  RMDir /r "$INSTDIR\data"
!macroend
