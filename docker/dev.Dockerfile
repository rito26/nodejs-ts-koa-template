################################################################
#       Nodejs 서버 배포 : 기존 OS에 Node 설치가 안된 경우
################################################################
FROM node:20.5-alpine3.17

WORKDIR /home/node/app
COPY . .

RUN npm install
RUN npm run "build"

EXPOSE 3100
CMD [ "npm", "run", "serve:dev" ]