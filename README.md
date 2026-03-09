# Resource Management System

A full-stack resource booking and administration platform for campuses and organizations.

It helps teams manage buildings, resources, facilities, maintenance records, bookings, cupboards, and shelves from a single dashboard with role-based access control.

## Highlights

- Modern Next.js App Router application with REST-style route handlers.
- JWT authentication with secure `httpOnly` cookie sessions.
- Role-based dashboard and route protection (including URL-level guard).
- PostgreSQL + Prisma (with `@prisma/adapter-pg`).
- Interactive admin dashboard with charts and animated UI.
- Production-ready build configuration for Vercel and Next.js 16.

## Tech Stack

- `Next.js 16` + `React 19` + `TypeScript`
- `Tailwind CSS 4`
- `Framer Motion`
- `Recharts`
- `Prisma 7` + `pg`
- `jsonwebtoken`, `bcryptjs`
- `sonner`, `lucide-react`

## Core Modules

- Authentication: login, signup, logout, current-user session (`/api/me`)
- Resource Types: create and manage categories (classroom, lab, etc.)
- Buildings: manage building metadata and floors
- Resources: manage actual resources and their locations
- Facilities: attach facilities/features to resources
- Maintenance: track service status and schedule
- Bookings: create and monitor booking lifecycle
- Cupboards and Shelves: inventory-style storage management

## Role-Based Access

The app currently uses these roles:

- `admin`
- `student`
- `faculty`
- `maintainer`

Dashboard route protection is enforced in `proxy.ts` and `app/dashboard/layout.tsx`.

Example access map:

- `/dashboard/resources`: `admin`
- `/dashboard/buildings`: `admin`
- `/dashboard/resource-types`: `admin`
- `/dashboard/cupboards`: `admin`, `student`, `faculty`
- `/dashboard/bookings`: `admin`, `student`, `faculty`
- `/dashboard/maintenance`: `admin`, `student`, `faculty`, `maintainer`

Unauthorized dashboard paths are redirected to `/dashboard/unauthorized`.

## Project Structure

```text
app/
	api/
		(auth)/login
		(auth)/logout
		(auth)/signup
		bookings
		buildings
		cupboards
		dashboard/stats
		facilities
		maintenance
		me
		resource-types
		resources
		shelves
		users
	dashboard/
	generated/prisma/
components/
lib/
prisma/
proxy.ts
```

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/hetbhalani/Resource-Management-System.git
cd resource-management-system
npm install
```

### 2. Configure environment

Create `.env` in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="604800"
```

Notes:

- `JWT_EXPIRES_IN` is currently used both as JWT `expiresIn` and cookie `maxAge` in code.
- Use a numeric value in seconds for consistency (example above is 7 days).

### 3. Prepare database

This repository includes `prisma/schema.prisma` (introspected-style schema) but no migration history folder.

- If your database is already provisioned with tables, just set `DATABASE_URL`.
- If starting fresh, create tables first, then run:

```bash
npx prisma generate
```

### 4. Run development server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Available Scripts

- `npm run dev`: start local development server
- `npm run build`: `prisma generate && next build`
- `npm run start`: run production server
- `npm run lint`: run ESLint

## API Overview

Auth:

- `POST /api/login`
- `POST /api/signup`
- `POST /api/logout`
- `GET /api/me`

Domain endpoints:

- `GET/POST /api/bookings`, `GET/PUT/DELETE /api/bookings/[id]`
- `GET/POST /api/buildings`, `GET/PUT/DELETE /api/buildings/[id]`
- `GET/POST /api/cupboards`, `GET/PUT/DELETE /api/cupboards/[id]`
- `POST /api/cupboards/book`, `GET /api/cupboards/my-bookings`
- `GET/POST /api/facilities`, `GET/PUT/DELETE /api/facilities/[id]`
- `GET/POST /api/maintenance`, `GET/PUT/DELETE /api/maintenance/[id]`
- `GET/POST /api/resource-types`, `GET/PUT/DELETE /api/resource-types/[id]`
- `GET/POST /api/resources`, `GET/PUT/DELETE /api/resources/[id]`
- `GET /api/resources/by-location`
- `GET/POST /api/shelves`, `GET/PUT/DELETE /api/shelves/[id]`
- `GET/POST /api/users`, `GET/PUT/DELETE /api/users/[id]`
- `GET /api/dashboard/stats`

## Deployment (Vercel)

This project is configured for Next.js 16 deployment.

- `proxy.ts` is used instead of deprecated `middleware.ts`.
- `next.config.ts` uses `serverExternalPackages: ["pg"]`.
- Build script already runs `prisma generate` before `next build`.

Set these environment variables in Vercel:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

Then deploy normally.

## License

Choose and add a license if this project is open-source.
