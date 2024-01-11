#!/bin/bash

############################### README ###############################
# - 배포된 도커 컨테이너로 프로필 및 포트 바인딩 변경
# - 프로필 : 1 / 2
######################################################################

################################ ARGS ################################
# $1: 포트 앞자리 (예: 300 -> 3001, 3002 사용)
# $2: 프로필 번호 (1, 2)
#
# 예시 : sh/__internal_switch.sh 300 1
#
######################################################################
PORT_PREFIX=$1
PROFILE=$2

############################### Setup ################################
if [ -z "$PROFILE" ]; then
    PROFILE="1"
elif [ "$PROFILE" -lt 1 ]; then
    PROFILE="1"
elif [ "$PROFILE" -gt 2 ]; then
    PROFILE="2"
fi
PORT=${PORT_PREFIX}${PROFILE}

sudo rm -f /etc/nginx/sites-enabled/*
FILE_DIR="/etc/nginx/sites-available/redirect_80_$PORT.conf"
sudo touch $FILE_DIR && sudo chmod 757 $FILE_DIR

############################### Nginx ################################
echo "" > $FILE_DIR
echo "server {" >> $FILE_DIR
echo "    listen 80 ;" >> $FILE_DIR
echo "    listen [::]:80 ;" >> $FILE_DIR
echo "    listen 443 ;" >> $FILE_DIR
echo "    listen [::]:443 ;" >> $FILE_DIR
echo "" >> $FILE_DIR
echo "    location / {" >> $FILE_DIR
echo "         proxy_pass http://127.0.0.1:${PORT};" >> $FILE_DIR
echo "         proxy_set_header X-Real-IP \$remote_addr;" >> $FILE_DIR
echo "         proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;" >> $FILE_DIR
echo "         proxy_set_header Host \$http_host;" >> $FILE_DIR
echo "    }" >> $FILE_DIR
echo "}" >> $FILE_DIR

#########################################################################

sudo ln -s $FILE_DIR /etc/nginx/sites-enabled/
sudo service nginx reload

# 완료
echo -e "\n\n========== Switch Dev: 80 -> $PORT (Profile $PROFILE) ==========\n\n"