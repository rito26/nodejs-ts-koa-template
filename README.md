# ATS Backend - Koa/ts
- Framework: Nodejs, Koa
- Script Language: Typescript
- DB: PostgreSQL

<br>

## 배포환경 로컬 리포지토리 초기 설정
```sh
sudo chmod 755 sh/init.sh && sh/init.sh
```

## 배포 방법
- 사전 설치 필요: Docker, Nginx

```sh
sh/deploy_dev.sh  # dev
sh/deploy_prod.sh # prod
```