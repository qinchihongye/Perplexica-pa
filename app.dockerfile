FROM node:20.18.0-alpine

ARG NEXT_PUBLIC_WS_URL=ws://127.0.0.1:3001
ARG NEXT_PUBLIC_API_URL=http://host.docker.internal:3001/api
ARG NEXT_PUBLIC_PY_API=http://host.docker.internal
ARG NEXT_PUBLIC_PYWS_API=ws://127.0.0.1
ARG NEXT_PUBLIC_PY_PORT=8013
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_PY_API=${NEXT_PUBLIC_PY_API}
ENV NEXT_PUBLIC_PY_PORT=${NEXT_PUBLIC_PY_PORT}
ENV NEXT_PUBLIC_PYWS_API=${NEXT_PUBLIC_PYWS_API}

WORKDIR /home/perplexica

COPY ui /home/perplexica/

RUN yarn install --frozen-lockfile
RUN yarn build

CMD ["yarn", "start"]