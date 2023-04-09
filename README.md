# Satpam

Satpam is a secure and trusted password manager and 2FA. Built with [Next.js](https://nextjs.org/), [Prisma](https://www.prisma.io/), and [Mantine UI](https://mantine.dev/).

## Prerequisites

- [Node.js](https://nodejs.org/en/)
- [Yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/)

## Installation

1. Clone the repository

```bash
git clone git@github.com:mgilangjanuar/satpam.git && \
cd satpam
```

2. Install dependencies

```bash
yarn
```

3. Create [`.env.local`](#Environment%20Variables) file

```bash
cp .env.example .env.local
```

Edit the `.env.local` file with your own configuration.

4. Build and run the server

```bash
yarn build && \
yarn start
```

## Environment Variables

| Name | Description | Default | Required |
| --- | --- | --- | --- |
| DATABASE_URL | Database URL | - | Yes |
| SMTP_URL | SMTP URL | - | Yes |
| EMAIL_FROM | Email sender | - | Yes |
| BASE_URL | Base URL | - | Yes |
| SECRET_KEY | Secret key | - | Yes |
