FROM python:3.9.21-slim-bookworm

WORKDIR /home/perplexica

COPY python_log /home/perplexica/python_log
COPY config.toml /home/perplexica
COPY requirements.txt /home/perplexica
COPY python_src /home/perplexica/python_src

RUN pip3 install  -i https://mirrors.aliyun.com/pypi/simple/  --trusted-host mirrors.aliyun.com  -r requirements.txt 
RUN apt-get update
RUN apt-get install -y vim

EXPOSE 8013

CMD ["python","python_src/main.py"]