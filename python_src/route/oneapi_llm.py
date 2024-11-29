import toml
import openai


# 读取 config.toml 文件
with open('config.toml', 'r') as file:
    config = toml.load(file)

# 读取配置
api_key = config['API_KEYS']['OPENAI']
base_url = config['API_ENDPOINTS']['OPENAIBASEURL']
model_name = config['GENERAL']['LLM_NAME']
openai.api_key = api_key
openai.base_url = base_url


async def post_completions(prompt, stream=False):
    client = openai.OpenAI(api_key=api_key, base_url=base_url)
    resp = client.chat.completions.create(
        model=model_name,
        messages=[{
            "role": "system",
            "content": "你是一名专业助手，请根据用户的要求完成任务，请用中文回答"
        },
            {
                "role": "user",
                "content": prompt
            }
        ],
        stream=stream,
        max_tokens=512
    )
    # if stream:
    #     for chunk in resp:
    #         if chunk.choices[0].delta.content is not None:
    #             print(chunk.choices[0].delta.content, end="")
    #         else:
    #             print(resp.choices[0].message.content)
    # else:
    #     print(resp_content)
    resp_content = resp.choices[0].message.content
    return resp_content
