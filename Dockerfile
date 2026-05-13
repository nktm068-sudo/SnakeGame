# Использовать официальный легкий образ Python
FROM python:3.11-slim

# Установить рабочую директорию внутри контейнера
WORKDIR /app

# Копировать файл зависимостей
COPY requirements.txt .

# Установить необходимые библиотеки Python без кэширования для уменьшения размера образа
RUN pip install --no-cache-dir -r requirements.txt

# Копировать все остальные файлы проекта (server.py и index.html) в контейнер
COPY . .

# Открыть порт 8000 для внешнего доступа
EXPOSE 8000

# Команда для запуска сервера через Python
CMD ["python", "server.py"]
