FROM node:18-alpine

WORKDIR /home/perplexica

# 复制项目文件
COPY src /home/perplexica/src
COPY tsconfig.json /home/perplexica/
COPY drizzle.config.ts /home/perplexica/
COPY package.json /home/perplexica/
COPY yarn.lock /home/perplexica/

# 创建所需目录
RUN mkdir -p /home/perplexica/data /home/perplexica/uploads

# 安装依赖并构建项目，同时清理缓存
RUN apk add --no-cache vim \
    && yarn install --frozen-lockfile --network-timeout 600000 \
    && yarn build \
    && rm -rf /home/perplexica/node_modules/.cache

CMD ["yarn", "start"]
