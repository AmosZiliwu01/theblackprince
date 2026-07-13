# The Black Prince — Blox Fruits Shop

Full-stack Blox Fruits marketplace: Fruit, Akun, Joki, Community, Live TikTok, Giveaway, Event, FAQ, dan **AI Assistant Admin** yang membaca database realtime.

## Tech Stack
- **Frontend**: TanStack Start v1 (React 19 + Vite 7) + Tailwind CSS v4 + Framer / lucide-react + react-markdown
- **Backend**: Lovable Cloud (Supabase managed) — PostgreSQL + Auth + RLS
- **AI**: Groq API (`llama-3.3-70b-versatile` default, dapat diubah dari dashboard)
- **Deploy**: Cloudflare Workers via TanStack Start (auto oleh Lovable). Bisa juga di-deploy manual ke Vercel dengan build TanStack Start.

## Fitur

### Publik (Mobile-first, Dark Gaming Theme)
- Landing page dengan quick menu, hero, announcement bar berjalan, dan CTA AI
- Halaman: `/fruits`, `/joki`, `/accounts`, `/community`, `/live`, `/giveaway`, `/events`, `/faq`, `/chat`
- Bottom navigation di mobile
- SEO: meta, OG, Twitter card, sitemap.xml, llms.txt, robots.txt, PWA manifest

### AI Assistant Admin (`/chat`)
- Chat mirip ChatGPT (bubble, typing indicator, markdown, auto scroll, timestamp)
- Otomatis membaca data dari **seluruh tabel dashboard** untuk menjawab harga, stok, PS, live, giveaway, event, FAQ
- Persona: ramah, gaul, paham singkatan Indonesia (bg, min, gk, bjir, dll.)
- Riwayat chat di localStorage + tersimpan di database (`chat_sessions` + `chat_messages`) untuk direview admin

### Admin Dashboard (`/admin`)
Sidebar penuh dengan halaman:
- Dashboard (statistik)
- Harga Fruit (CRUD)
- Kategori (CRUD)
- Harga Joki (CRUD)
- Harga Akun (CRUD)
- Komunitas (CRUD link)
- Status Live TikTok (toggle single row)
- Giveaway (CRUD)
- Event (CRUD)
- FAQ (CRUD)
- Pengaturan AI (system prompt, greeting, forbidden words, model — single row)
- Banner (CRUD)
- Announcement (CRUD)
- Pengaturan Website (single row)
- Riwayat Chat (list sesi, view messages, export JSON, hapus)

Semua perubahan langsung dipakai AI karena AI membaca database realtime — tidak perlu redeploy.

## Cara Menjalankan (Localhost)

```bash
bun install
bun run dev
```

Kunjungi `http://localhost:8080`.

## Environment Variables

Sudah otomatis di-set oleh Lovable Cloud:
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (client)
- `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server)
- `GROQ_API_KEY` — sudah tersimpan di Lovable secrets

Untuk deploy manual di luar Lovable, salin `.env.example` menjadi `.env` dan isi nilainya.

## Cara Assign Admin

1. Buka `/auth`, sign up dengan email + password.
2. Setelah user berhasil dibuat (bisa lihat di Cloud → Users), jalankan SQL berikut di dashboard Cloud:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('<user-id-dari-auth.users>', 'admin');
```

3. Login kembali di `/auth`, lalu klik menu Admin — halaman `/admin` akan terbuka penuh.

Kalau kamu sudah signup dan lupa user id, kunjungi `/admin` — halaman akses ditolak akan menampilkan SQL siap-copy dengan user id kamu sendiri.

## Struktur Kode

```
src/
├── components/
│   ├── site/               # public site: layout, nav, announcement bar
│   ├── admin/              # generic AdminCrud + SingletonEditor
│   └── ui/                 # shadcn primitives
├── lib/
│   ├── ai-chat.functions.ts  # createServerFn → Groq
│   └── site-queries.ts       # queryOptions untuk data publik
├── routes/
│   ├── __root.tsx
│   ├── index.tsx
│   ├── fruits.tsx, joki.tsx, accounts.tsx, ...
│   ├── chat.tsx            # AI chat page
│   ├── auth.tsx            # admin login/signup
│   ├── _authenticated/
│   │   ├── route.tsx       # auth + role gate
│   │   └── admin/
│   │       ├── route.tsx   # sidebar layout
│   │       ├── index.tsx   # dashboard
│   │       ├── fruits.tsx, joki.tsx, ... (semua CRUD)
│   │       ├── ai-settings.tsx, live.tsx, website.tsx (singleton)
│   │       └── chats.tsx
│   └── sitemap[.]xml.ts
└── integrations/supabase/  # generated, jangan diedit
```

## Keamanan

- **RLS aktif** di seluruh tabel.
- Data toko: publik hanya bisa membaca (`FOR SELECT USING (true)`), write hanya admin (`has_role(auth.uid(),'admin')`).
- Chat messages & sessions: publik bisa insert (agar AI publik jalan), hanya admin yang bisa read/delete.
- `user_roles` **tidak** disimpan di tabel profiles → tidak bisa privilege-escalation.
- `has_role()` dibuat `SECURITY DEFINER` dengan `search_path=public` — pola standar Supabase.
- Server function `chatWithAssistant` memvalidasi input via Zod (max 30 pesan, max 4000 char per pesan).
