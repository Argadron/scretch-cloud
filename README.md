# Инструкция по запуску проекта Scretch Cloud
=====================================================

## Предварительные требования
---------------------------

Перед началом установки убедитесь, что у вас установлены следующие компоненты:

### Необходимое ПО

* Node.js (версия >=18.10.0)
* npm (пакетный менеджер Node.js)
* PostgreSQL сервер (локальный)
* Git (для скачивания проекта)

### Архитектура проекта
----------------------

Проект использует микросервисную архитектуру, состоящую из следующих компонентов:

* Клиентская часть (HTML/CSS/JavaScript)
* Шлюз принимающий запросы (Gateway/NestJS)
* Сервис аутентификации (NestJS)
* Сервис файлов (NestJS)
* Сервис пользователей (NestJS)
* Сервис платежей (NestJS)
* Сервис приложений пользователей (NestJS)
* Сервис хранилищей (NestJS)
* PostgreSQL база данных

## Установка проекта
-------------------

### Шаг 1: Создание директории и клонирование репозитория

```bash
mkdir scretch-cloud
cd scretch-cloud
git clone https://github.com/Argadron/scretch-cloud.git

```
### Шаг 2: Установка зависимостей

Установите зависимости для каждой части проекта:

```bash
cd scretch-cloud-server
npm install

cd ../scretch-cloud-client
npm install

```
## Настройка окружения
----------------------

### Шаг 1: Создание файла конфигурации

### Создайте файл .env в папках scretch-cloud-client и scretch-cloud-server.Заполните их в соответствии с образцом .env.example

### Шаг 2: Настройка PostgreSQL

1. Откройте PostgreSQL клиент (например, pgAdmin)
2. Создайте новую базу данных с именем scretch-cloud
3. Обновите данные подключения в файле .env

## Настройка Prisma ORM
----------------------
Выполните команду:

```bash
npx prisma db push
```

## Запуск проекта
------------------

Откройте восемь терминалов и запустите каждый микросервис отдельно:

### Терминал 1: Сервис аутентификации

```bash
cd scretch-cloud-server
npm run start auth
```
### Терминал 2: Сервис файлов

```bash
cd scretch-cloud-server
npm run start file
```

### Терминал 3: Сервис пользователей

```bash
cd scretch-cloud-server
npm run start users
```

### Терминал 4: Сервис платежей
```bash 
cd scretch-cloud-server
npm run start payment
```

### Терминал 5: Сервис хранилищ
```bash
cd scretch-cloud-server
npm run start storage
```

### Терминал 6: Сервис приложений пользователей
```bash
cd scretch-cloud-server
npm run start user-app
```

### Терминал 7: Шлюз для обработки входящих запросов (Gateway)
```bash
cd scretch-cloud-server
npm run start gateway
```

### Терминал 8: Клиентская часть

```bash
cd scretch-cloud-client
npm run start
```

## Проверка работоспособности
---------------------------

Убедитесь, что шлюз и клиент доступны:

* Шлюз: http://localhost:3000
* Клиентская часть: http://localhost:5000

Проверьте логи в терминалах на отсутствие ошибок.

## Важные замечания
-------------------

* При первом запуске может потребоваться несколько минут для инициализации всех сервисов
* Если появляются ошибки подключения к базе данных, проверьте корректность данных в файле `.env`