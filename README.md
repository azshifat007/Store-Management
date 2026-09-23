<div align="center">

# 🏪 Store Management

![Next.js](https://img.shields.io/badge/Next.js-16.3.6-black?style=for-the-badge&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.19.3-2D3740?style=for-the-badge&logo=prisma&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

> A full-featured, production-ready **POS & Store Management System** built with modern web technologies.

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | Secure login & registration with role-based access (Owner / Staff) |
| 📊 **Dashboard** | Overview of sales, purchases, expenses, and inventory at a glance |
| 📦 **Products** | Full CRUD with barcode, stock tracking, expiry dates & low-stock alerts |
| 🏷️ **Categories** | Hierarchical category management (parent-child) |
| 👥 **Customers** | Customer profiles with credit limits & transaction ledger |
| 🏭 **Suppliers** | Supplier management with purchase history & ledger |
| 🧾 **Sales (POS)** | Point-of-sale invoicing with discounts, delivery charges & multiple payment types |
| 🛒 **Purchases** | Record purchases from suppliers with item-level tracking |
| 💰 **Expenses** | Categorized expense tracking |
| 📈 **Reports** | Sales, purchase & financial reports |
| ⚙️ **Settings** | Store name, currency, tax rate, low-stock threshold & more |
| 💳 **Multi-Payment** | Support for Cash, Credit, and Both payment types |
| 🪙 **Dual Ledger** | Customer & supplier debit/credit ledger with balance tracking |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router) |
| **UI Library** | React 19 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 |
| **Database** | PostgreSQL |
| **ORM** | Prisma 6 |
| **Auth** | Session-based with bcryptjs |
| **Validation** | Zod |

---

## 📁 Project Structure

```
Store-Management/
├── src/
│   ├── app/
│   │   ├── (auth)/            # Authentication routes
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── shell.tsx
│   │   ├── (dashboard)/       # Authenticated dashboard routes
│   │   │   ├── categories/
│   │   │   ├── customers/
│   │   │   ├── expenses/
│   │   │   ├── products/
│   │   │   ├── purchases/
│   │   │   ├── reports/
│   │   │   ├── sales/
│   │   │   ├── settings/
│   │   │   └── suppliers/
│   │   └── layout.tsx
│   ├── components/            # Shared & feature components
│   ├── lib/                   # Utilities, auth, Prisma client, actions
│   │   ├── actions/           # Server actions (CRUD, auth, ledger)
│   │   └── prisma.ts          # Prisma client instance
│   └── proxy.ts
├── prisma/
│   ├── schema.prisma          # Database schema (PostgreSQL)
│   ├── migrations/            # DB migrations
│   └── dev.db                 # SQLite database (local dev only)
├── public/                    # Static assets
├── next.config.ts
├── tailwind.config (via CSS)
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and **npm** (or yarn, pnpm, bun)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd Store-Management

# Install dependencies
npm install

# Set up environment variable
echo "DATABASE_URL=\"postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public\"" > .env

# Push the Prisma schema & generate client
npx prisma generate
```

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 🗄️ Database Schema

The application uses **Prisma ORM** with **PostgreSQL**. For local development, you can use a local PostgreSQL instance or **Prisma Postgres** (free tier). Key models include:

- **User** — Staff & owner accounts with roles (`OWNER`, `STAFF`)
- **Session** — Authentication tokens
- **Product** — Inventory items with pricing, stock & expiry
- **Category** — Hierarchical product categories
- **Customer** — Customer info with credit limits
- **Supplier** — Supplier info with purchase history
- **Sale / SaleItem** — Sales invoices with line items
- **Purchase / PurchaseItem** — Purchase orders with line items
- **Expense / ExpenseCategory** — Business expenses
- **CustomerTransaction / SupplierTransaction** — Debit/credit ledgers
- **Settings** — Store configuration (name, currency, tax, thresholds)

---

## 🔑 Key Concepts

### Roles
- **Owner** — Full access to all features and settings
- **Staff** — Day-to-day operations (sales, purchases, inventory viewing)

### Payment Types
- `CASH` — Cash payment
- `CREDIT` — Credit (on account)
- `BOTH` — Split payment

### Ledger System
Customers and suppliers maintain running balances through `CustomerTransaction` and `SupplierTransaction` records, tracking debits and credits with automatic balance calculation.

### Low Stock Alerts
Products have a configurable `lowStockThreshold` and `stockQuantity`. The system flags items that fall below the threshold for reordering.

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

## ☁️ Deployment

### Vercel (Recommended)

This app requires a **PostgreSQL** database (SQLite is not supported on Vercel). Here's how to deploy:

1. **Create a PostgreSQL database** using one of these providers:
   - [Prisma Postgres](https://console.prisma.io) — free tier, managed by Prisma
   - [Neon](https://neon.tech) — free tier, serverless PostgreSQL
   - [Supabase](https://supabase.com) — free tier, PostgreSQL-based
   - [Railway](https://railway.app) — easy PostgreSQL hosting

2. **Copy your connection string** (e.g., `postgresql://user:pass@host:5432/db?schema=public`)

3. **Set the `DATABASE_URL` environment variable** in your Vercel project settings:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add `DATABASE_URL` with your PostgreSQL connection string

4. **Deploy** — Vercel will build and deploy automatically

### Local Development

For local development, use either:

- **Prisma Postgres** (local): `npx prisma dev`
- **Neon/Supabase**: set `DATABASE_URL` in `.env` to your remote DB URL
- **Local PostgreSQL**: install PostgreSQL locally and create a database, then set the connection string in `.env`

```bash
# Install dependencies
npm install

# Set your DATABASE_URL in .env, then:
npx prisma generate

# Push the schema to your database (first time)
npx prisma db push

# Run the development server
npm run dev
```

---

<p align="center">
  Built with ❤️ using Next.js, Prisma & Tailwind CSS
</p>
