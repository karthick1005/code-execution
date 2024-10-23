FROM python:3.9-slim

WORKDIR /usr/src/app

COPY . .

RUN pip install flask

EXPOSE 4000

CMD ["python3", "index.py"]
