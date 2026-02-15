# Smart Bookmark App 🔖

A real-time bookmark manager built with **Next.js 15 (App Router)** and **Supabase**. This application allows users to save, manage, and sync bookmarks instantly across devices using WebSockets.

## 🚀 Live Demo
[Project Live Link](https://smart-bookmark-app-teal-seven.vercel.app/)

## ✨ Features
* **Google OAuth Authentication:** Secure passwordless login.
* **Real-time Synchronization:** Bookmarks appear and disappear instantly across all open tabs/devices without refreshing.
* **Row Level Security (RLS):** Data is strictly private; users can only access their own bookmarks.
* **Responsive UI:** Styled with Tailwind CSS for mobile and desktop.

## 🛠️ Tech Stack
* **Frontend:** Next.js 15 (App Router), React, Tailwind CSS
* **Backend:** Supabase (PostgreSQL, Auth, Realtime)
* **Deployment:** Vercel

## 🧠 Challenges & Solutions
*Per the assignment requirements, here are the specific technical hurdles I encountered and how I solved them:*

### 1. Real-time "Delete" Events Not Reflecting
**The Problem:** While adding bookmarks updated the UI instantly, deleting a bookmark required a page refresh to disappear.
**The Investigation:** I discovered that by default, Postgres only sends the Primary Key (`id`) in a `DELETE` event. However, my client-side subscription was filtering events based on `user_id` (`filter: 'user_id=eq.${user.id}'`). Since the delete event didn't contain the `user_id`, the filter blocked it.
**The Solution:** I altered the table's replica identity to `FULL` using SQL (`alter table bookmarks replica identity full;`). This forced Postgres to send the entire row data (including `user_id`) even on delete events, allowing the filter to match and the UI to update instantly.

### 2. WebSocket Connection Stability in Development
**The Problem:** During local development, the Realtime connection would frequently disconnect with `TIMED_OUT` errors or "WebSocket is closed" warnings.
**The Solution:** This was caused by React Strict Mode in Next.js, which double-invokes effects, creating a race condition where the socket opens and closes too quickly. I solved this by:
1.  Temporarily disabling `reactStrictMode` in `next.config.ts` for development.
2.  Refactoring the Supabase client initialization to use `useState(() => createClient())`, ensuring the client instance remains stable across re-renders.

### 3. Row Level Security (RLS) vs. Realtime
**The Problem:** Initial attempts to subscribe to the `bookmarks` table failed silently because the RLS policy ("Users can only view their own data") was blocking the Realtime system from broadcasting events.
**The Solution:** I verified that the RLS policy was correct but realized the `supabase_realtime` publication needed to be explicitly enabled for the `bookmarks` table. I also ensured my client-side filter matched the authenticated user's ID exactly, preventing unnecessary data transmission.

## 📦 Getting Started Locally

1. **Clone the repository**
   
   ```bash
   git clone [https://github.com/your-username/smart-bookmark-app.git](https://github.com/your-username/smart-bookmark-app.git)
   cd smart-bookmark-app
   ```
2. **Install dependencies**
   
   ```bash
   npm install
   ```
3. **Environment Setup**
   Create a .env.local file in the root:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. **Run the development server**

   ```bash
   npm run dev
   ```
   Open http://localhost:3000 with your browser to see the result.
<br>
<br>

**Note:** This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
