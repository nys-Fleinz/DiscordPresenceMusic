@echo off
echo Installation dépendances...

call npm i
call npm install pm2 pm2-windows-startup -g

call pm2 start presence.js --name="discord-rpc-scrobbler"

call pm2-startup install
call pm2 save

echo Installation terminé, script lancé en arrière plan.
pause