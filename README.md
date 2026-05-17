# Next.js + Supabase Starter Template

A modern Next.js application with Supabase integration pre-configured using your provided Supabase project credentials.

## Features

- ✅ Next.js 14 with App Router
- ✅ TypeScript support
- ✅ Tailwind CSS for styling
- ✅ Pre-configured Supabase client
- ✅ Environment variables setup
- ✅ Responsive design
- ✅ Data fetching with error handling

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace the values with your actual Supabase project URL and Anon Key.

### 3. Update Database Table

Open `app/page.tsx` and replace `'your_table_name'` with your actual Supabase table name:

```typescript
const { data: tableData, error: fetchError } = await supabase
  .from('your_table_name') // ← Replace this
  .select('*')
  .limit(10)
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
├── app/
│   ├── layout.tsx        # Root layout with header/footer
│   ├── page.tsx          # Home page with Supabase data fetching
│   └── globals.css       # Global styles with Tailwind
├── lib/
│   └── supabase.ts       # Supabase client configuration
├── .env.local            # Environment variables (already configured)
├── package.json
├── tsconfig.json
└── next.config.js
```

## Customization

### Adding Authentication

To add Supabase authentication, you can extend the Supabase client in `lib/supabase.ts`:

```typescript
// Add auth methods
export const signInWithPassword = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password })
}

export const signOut = async () => {
  return await supabase.auth.signOut()
}
```

### Creating API Routes

Create server-side API routes in the `app/api/` directory:

```typescript
// app/api/hello/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Hello World' })
}
```

## Deployment

### Vercel

Deploy to Vercel with automatic environment variable syncing:

1. Push your code to a GitHub repository
2. Import the project on Vercel
3. Add your Supabase environment variables in Vercel dashboard

### Other Platforms

For other hosting platforms, make sure to set the environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

MIT