#!/bin/bash
####################################
#   리포지토리 클론 시 최초 1회 실행
####################################

sudo find . -type f -name "*.sh" -exec chmod 755 {} \; && sudo find . -type f -name "*.sh" -exec chown $USER {} \;
sudo git config core.fileMode false