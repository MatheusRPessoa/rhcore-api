# RHCore

API REST para gestão de Recursos Humanos, desenvolvida com NestJS, TypeORM e PostgreSQL.

## Tecnologias

- **NestJS** — framework Node.js
- **TypeORM** — ORM com PostgreSQL
- **Passport + JWT** — autenticação com access/refresh token
- **Swagger** — documentação automática da API
- **Pino** — logging estruturado
- **Jest** — testes de integração com banco real
- **Docker** — banco de dados em container

## Módulos

| Módulo        | Descrição                                 |
| ------------- | ----------------------------------------- |
| `auth`        | Autenticação JWT (login, refresh, logout) |
| `users`       | Gestão de usuários do sistema             |
| `employees`   | Gestão de funcionários                    |
| `departments` | Gestão de departamentos                   |
| `positions`   | Gestão de cargos                          |
| `vacations`   | Solicitação e gestão de férias            |
| `requests`    | Solicitações diversas                     |

## Pré-requisitos

- Node.js 20+
- Docker e Docker Compose

## Instalação

```bash
npm install
Configuração
Crie um arquivo .env na raiz do projeto:


DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=rhcore
JWT_SECRET=seu_secret
JWT_REFRESH_SECRET=seu_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
Banco de dados

# Subir container PostgreSQL
npm run db:up

# Rodar migrations
npm run migration:run

# Derrubar container
npm run db:down
Executando a aplicação

# desenvolvimento com watch
npm run dev

# produção
npm run start:prod
Documentação da API
Com a aplicação rodando, acesse:


http://localhost:3000/api
Testes
Os testes são de integração e rodam contra o banco real — certifique-se de que o banco está disponível antes de executar.


# todos os testes
npm run test

# módulo específico
npm run test -- src/employees/tests/post-employee.spec.ts

# cobertura
npm run test:cov
Migrations

# gerar migration a partir das entidades
npm run migration:generate

# rodar migrations pendentes
npm run migration:run

# reverter última migration
npm run migration:revert
Commits
O projeto usa Conventional Commits via Commitizen:


npm run commit
Licença
UNLICENSED
```
