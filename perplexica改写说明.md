- git 地址

  > https://github.com/qinchihongye/Perplexica-pa.git

- config.toml 中的内容

  ```toml
  [API_KEYS]
  OPENAI = "sk-PJrYIIj1QwodFT4n00Df8956B465411389C44dF11eDc07Da"
  GROQ = ""
  ANTHROPIC = ""
  GEMINI = ""

  [API_ENDPOINTS]
  OLLAMA = "http://host.docker.internal:11434"
  OPENAIBASEURL = "http://38.54.50.54:8025/v1"
  SELFSEARCHURL = "http://host.docker.internal"
  SEARXNG = "http://localhost:32768"

  [GENERAL]
  PORT = 3_001
  SIMILARITY_MEASURE = "cosine"
  KEEP_ALIVE = "5m"
  PYPORT = 8_013
  LLM_NAME = "qwen2.5-72b-instruct"
  TIMEOUT = 5
  RETRIEVALURL = "http://js1.blockelite.cn:19575/search"

  ```

- query 改 写接口

  ```shell
  curl --location 'http://localhost:8013/rewrite_query' \
  --header 'Content-Type: application/json' \
  --data '{
      "query":"24年的大学生就业情况怎么样"
  }'
  ```

  typescipt 中 url 这样获取

  从如下文件中 import

  > /src/config.ts

  ```typescript
  import { getSelfSearchUrl, getPyPort } from '../config';

  const urlroot = getSelfSearchUrl();
  const pyport = getPyPort();

  const url = urlroot + ':' + pyport + '/rewrite_query';
  ```

- 增加思考过程 **_添加.env 文件_**
  > ui/.env
  ```
  NEXT_PUBLIC_WS_URL=ws://localhost:3001
  NEXT_PUBLIC_API_URL=http://localhost:3001/api
  NEXT_PUBLIC_PY_API=http://host.docker.internal
  NEXT_PUBLIC_PY_PORT=8013
  ```
