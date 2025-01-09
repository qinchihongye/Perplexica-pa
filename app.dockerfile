# 第一阶段：构建阶段
FROM node:20.18.0-alpine AS builder

# 设置构建时环境变量
ARG NEXT_PUBLIC_WS_URL=ws://127.0.0.1:3001
ARG NEXT_PUBLIC_API_URL=http://host.docker.internal:3001/api
ARG NEXT_PUBLIC_PY_API=http://host.docker.internal
ARG NEXT_PUBLIC_PYWS_API=ws://127.0.0.1
ARG NEXT_PUBLIC_PY_PORT=8013
ARG NEXT_PUBLIC_VERIFYTOKEN=${NEXT_PUBLIC_VERIFYTOKEN}

# 设置工作目录
WORKDIR /home/perplexica

# 复制项目文件
COPY ui /home/perplexica/

# 安装依赖并构建项目
RUN yarn install --frozen-lockfile
RUN yarn build

# 第二阶段：运行阶段
FROM node:20.18.0-alpine

# 设置运行时环境变量
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_PY_API=${NEXT_PUBLIC_PY_API}
ENV NEXT_PUBLIC_PY_PORT=${NEXT_PUBLIC_PY_PORT}
ENV NEXT_PUBLIC_PYWS_API=${NEXT_PUBLIC_PYWS_API}
ENV NEXT_PUBLIC_VERIFYTOKEN=${NEXT_PUBLIC_VERIFYTOKEN}

# 设置工作目录

# 设置工作目录
WORKDIR /home/perplexica

# 从构建阶段复制构建工件
COPY --from=builder /home/perplexica /home/perplexica

# 指定启动命令
CMD ["yarn", "start"]
