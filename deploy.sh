#!/bin/zsh
DEPLOY_DIR=chat
BUILD_CMD=build
HTML_DIR=/home/server/nginx/html
SERVER=api.fcdml.com

if [[ $1 = stage ]]; then
  NODE_ENV=stage
  DEPLOY_DIR=${DEPLOY_DIR}-stage
  BUILD_CMD=${BUILD_CMD}:stage
fi

check_dir="$(
  cat <<-EOF
  if [ ! -d ${HTML_DIR}/${DEPLOY_DIR} ]; then
    mkdir -p ${HTML_DIR}/${DEPLOY_DIR}
  fi
EOF
)"

ssh root@${SERVER} "$check_dir" &&
  yarn $BUILD_CMD &&
  cd dist &&
  tar -zcvf ${DEPLOY_DIR}.tar.gz * &&
  scp -r ${DEPLOY_DIR}.tar.gz root@${SERVER}:${HTML_DIR}/${DEPLOY_DIR}/ &&
  ssh root@${SERVER} "tar -zxvf ${HTML_DIR}/${DEPLOY_DIR}/${DEPLOY_DIR}.tar.gz -C ${HTML_DIR}/${DEPLOY_DIR}/"
