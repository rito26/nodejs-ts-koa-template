#!/bin/bash

############################### README ###############################
# 도커를 이용해 Nodejs 프로젝트 배포 (이중화)
######################################################################

################################ ARGS ################################
# $1: 프로젝트명 (예: api-server)
# $2: 배포 구분 (예: dev, prod)
# $3: 포트 앞자리 (예: 300 -> 3001, 3002 사용)
#
# 예시: sh/__internal_deploy.sh api-server dev 300
#
######################################################################
PROJECT_NAME=$1
KIND=$2
PORT_PREFIX=$3

############################### STATE ################################
DATA_DIR=$(pwd)/state
DATA="${DATA_DIR}/${KIND}_state.data"

sudo mkdir $DATA_DIR -p
sudo touch $DATA
sudo chmod 755 $DATA && sudo chown $USER $DATA

STATE=$(cat $DATA)

if [ "$STATE" = "1" ]; then
    echo "2" > $DATA
    echo "${KIND}: Profile 2"
    PROFILE=2
else
    echo "1" > $DATA
    echo "${KIND}: Profile 1"
    PROFILE=1
fi

########################### Configuration ###########################
IMAGE_NAME="${PROJECT_NAME}-${KIND}-0$PROFILE:latest"
CONTAINER_NAME="${PROJECT_NAME}-${KIND}-${PORT_PREFIX}${PROFILE}"
DEPLOY_PATH=$(pwd)
DOCKER_FILE_PATH=docker/${KIND}.Dockerfile
PORT=${PORT_PREFIX}${PROFILE}
CONTAINER_PORT=3100

############################### STAGE ################################
# 0. Docker prune
echo -e "\n===== 0. Docker Prune ====="
docker system prune --all --force

# 1. Git Pull
echo -e "\n===== 1. Git Pull ====="
sudo git -C $DEPLOY_PATH pull

# 2. 컨테이너 제거
echo -e "\n===== 2. Remove Container ====="
docker ps | grep "$IMAGE_NAME" | awk '{print $1}' | xargs -r docker rm -f

# 3. 이미지 제거
echo -e "\n===== 3. Remove Image ====="
docker images | grep "${IMAGE_NAME%%:*}" | awk '{print $3}' | xargs -r docker rmi -f

# 4. 이미지 빌드
echo -e "\n===== 4. Rebuild Image ====="
docker build -t $IMAGE_NAME $DEPLOY_PATH -f $DOCKER_FILE_PATH

# 5. 컨테이너 실행
echo -e "\n===== 5. Restart Container ====="
docker run -d --name $CONTAINER_NAME -p $PORT:$CONTAINER_PORT $IMAGE_NAME

# 6. 컨테이너 확인
echo -e "\n===== 6. Check Container State ====="
docker ps

# 7. Nginx 연결 변경
sh/__internal_switch.sh $PORT_PREFIX $PROFILE