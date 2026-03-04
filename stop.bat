@echo off
echo Désinstallation...

call pm2 delete "discord-rpc-scrobbler"
call pm2 save --force
call pm2-startup uninstall

set /p choice="Voulez-vous désinstaller PM2 ? (y/n) : "
if /i "%choice%"=="y" (
    call npm uninstall pm2 pm2-windows-startup -g
    echo PM2 a été supprimé.
)

echo Le script a bien été désactivé.
pause