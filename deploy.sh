#!/bin/bash

git pull origin main && \
yarn && \
yarn prisma migrate deploy && \
yarn build && \
pm2 restart satpam