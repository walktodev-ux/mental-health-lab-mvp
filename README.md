# Mental Health Lab MVP

Стек:
- Next.js
- TypeScript
- Tailwind CSS
- shadcn-style UI components
- Auth.js / NextAuth
- PostgreSQL
- Prisma

## Запуск

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

## Google OAuth

У `.env` потрібно додати:

```env
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
AUTH_SECRET=""
DATABASE_URL=""
NEXTAUTH_URL="http://localhost:3000"
```

## Як зробити себе адміном

Після першого входу через Google відкрий Prisma Studio:

```bash
npx prisma studio
```

У таблиці `User` зміни поле `role` з `STUDENT` на `ADMIN`.

## Основні сторінки

- `/login`
- `/dashboard`
- `/dashboard/tests`
- `/dashboard/history`
- `/admin`
- `/admin/results`
- `/admin/users`
