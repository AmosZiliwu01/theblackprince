import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(4000),
});

const InputSchema = z.object({
  sessionKey: z.string().min(1).max(64),
  messages: z.array(MessageSchema).min(1).max(30),
});

// Supabase adalah SINGLE SOURCE OF TRUTH untuk AI.
// Client dibuat baru setiap request dan semua fetch memakai `no-store`
// + header anti-cache agar tidak ada layer cache (Worker/CDN/PostgREST)
// yang mengembalikan data lama setelah admin mengubah data.
function serverSb() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input: any, init: any = {}) => {
        const headers = new Headers(init.headers ?? {});
        headers.set("Cache-Control", "no-cache, no-store, max-age=0");
        headers.set("Pragma", "no-cache");
        return fetch(input, { ...init, headers, cache: "no-store" });
      },
    },
  });
}

function fmtIDR(n: number | null | undefined) {
  if (n == null) return "-";
  try {
    return "Rp " + Number(n).toLocaleString("id-ID");
  } catch {
    return `Rp ${n}`;
  }
}

/* ------------------------------------------------------------------ */
/* RETRIEVAL HELPERS                                                   */
/* ------------------------------------------------------------------ */

const STOPWORDS = new Set([
  "joki","jasa","get","unlock","beli","harga","berapa","buka","akun","account","fruit","buah",
  "ada","yang","yg","itu","ini","bang","kak","min","admin","apa","apakah","gimana","bagaimana",
  "mau","pengen","pengin","tolong","dong","ya","nya","untuk","dari","dengan","di","ke","dan",
  "murah","termurah","mahal","list","daftar","semua","stok","stock","ready","kah","sih","aja",
  "bisa","boleh","cara","kalau","kalo","saya","aku","kamu","punya","jual","dijual","open","po",
]);

const ALIASES: Record<string, string> = {
  gh: "godhuman",
  cdk: "cursed dual katana",
  sm: "sharkman karate",
  ek: "electric claw",
  dm: "dark mode",
  sh: "superhuman",
  v4: "race v4",
  bm: "buddha",
};

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function squash(s: string) {
  return normalize(s).replace(/\s/g, "");
}

function keywords(text: string): string[] {
  const norm = normalize(text);
  const out = new Set<string>();
  for (const raw of norm.split(" ")) {
    if (!raw) continue;
    const w = ALIASES[raw] ?? raw;
    if (STOPWORDS.has(w)) continue;
    if (w.length < 2) continue;
    out.add(w);
    if (w.includes(" ")) for (const p of w.split(" ")) if (p.length >= 2) out.add(p);
  }
  return [...out];
}

// skor kemiripan sederhana: substring match dua arah pada bentuk "squashed"
function matchScore(itemName: string, kws: string[], rawQuery: string): number {
  const item = squash(itemName);
  const q = squash(rawQuery);
  if (!item) return 0;
  let score = 0;
  if (q.includes(item) || item.includes(q)) score += 10;
  for (const k of kws) {
    const ks = squash(k);
    if (!ks || ks.length < 3) continue;
    if (item.includes(ks)) score += 5;
    else if (ks.includes(item)) score += 4;
    else if (levenshteinClose(item, ks)) score += 3;
  }
  return score;
}

function levenshteinClose(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 2) return false;
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return dp[m][n] <= 2;
}

type Intents = {
  fruits: boolean;
  joki: boolean;
  accounts: boolean;
  promotions: boolean;
  giveaways: boolean;
  events: boolean;
  live: boolean;
  faqs: boolean;
  community: boolean;
  announcements: boolean;
  contact: boolean;
  listAll: boolean;
};

const RX = {
  fruits: /\b(fruit|buah|permanent|perm|awaken|blox\s*fruit)\b/,
  joki: /\b(joki|jasa|unlock|farming|farm|leveling|level\s*up|raid|bounty|garansi\s*joki)\b/,
  accounts: /\b(akun|account|acc|id\s*game|rekber)\b/,
  promotions: /\b(promo|diskon|discount|potongan|sale|cashback)\b/,
  giveaways: /\b(giveaway|ga|gratisan|bagi\s*bagi|hadiah)\b/,
  events: /\b(event|acara|jadwal|turnamen|lomba)\b/,
  live: /\b(live|siaran|streaming|tiktok\s*live|onlive)\b/,
  faqs: /\b(faq|cara|gimana|bagaimana|pembayaran|bayar|payment|refund|garansi|aman|proses|metode)\b/,
  community:
    /\b(grup|group|komunitas|community|discord|whatsapp\s*grup|wa\s*grup|telegram|tiktok|instagram|ig|youtube|sosmed|link)\b/,
  announcements: /\b(pengumuman|announcement|info\s*terbaru|kabar)\b/,
  contact: /\b(kontak|contact|wa|whatsapp|nomor|hubungi|order|pesan|checkout)\b/,
  listAll: /\b(semua|list|daftar|katalog|apa\s*aja|apa\s*saja|jual\s*apa|produk)\b/,
};

function detectIntents(q: string): Intents {
  const n = normalize(q);
  const i: Intents = {
    fruits: RX.fruits.test(n),
    joki: RX.joki.test(n),
    accounts: RX.accounts.test(n),
    promotions: RX.promotions.test(n),
    giveaways: RX.giveaways.test(n),
    events: RX.events.test(n),
    live: RX.live.test(n),
    faqs: RX.faqs.test(n),
    community: RX.community.test(n),
    announcements: RX.announcements.test(n),
    contact: RX.contact.test(n),
    listAll: RX.listAll.test(n),
  };

  const anyProduct = i.fruits || i.joki || i.accounts;
  const anyIntent =
    anyProduct ||
    i.promotions ||
    i.giveaways ||
    i.events ||
    i.live ||
    i.faqs ||
    i.community ||
    i.announcements ||
    i.contact;

  // Kalau tidak terdeteksi intent sama sekali, kemungkinan user menyebut nama
  // produk tanpa kata kunci kategori (contoh: "buddha", "godhuman").
  // Cari di ketiga katalog produk (nama saja, bukan seluruh kolom).
  if (!anyIntent) {
    i.fruits = true;
    i.joki = true;
    i.accounts = true;
  }
  return i;
}

const MAX_MATCH = 8;
const MAX_LIST = 20;

function pickRelevant<T extends { name?: string | null; title?: string | null }>(
  rows: T[],
  kws: string[],
  rawQuery: string,
  listAll: boolean,
): { rows: T[]; truncated: number } {
  if (rows.length === 0) return { rows: [], truncated: 0 };
  if (listAll || kws.length === 0) {
    return { rows: rows.slice(0, MAX_LIST), truncated: Math.max(0, rows.length - MAX_LIST) };
  }
  const scored = rows
    .map((r) => ({ r, s: matchScore(String(r.name ?? r.title ?? ""), kws, rawQuery) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, MAX_MATCH)
    .map((x) => x.r);

  if (scored.length > 0) return { rows: scored, truncated: 0 };
  // tidak ada yang cocok -> kirim daftar nama ringkas supaya AI tetap bisa
  // menawarkan alternatif tanpa membakar token
  return { rows: rows.slice(0, MAX_LIST), truncated: Math.max(0, rows.length - MAX_LIST) };
}

/* ------------------------------------------------------------------ */
/* CONTEXT BUILDER (RETRIEVAL)                                         */
/* ------------------------------------------------------------------ */

async function buildContext(query: string): Promise<string> {
  const sb = serverSb();
  const intents = detectIntents(query);
  const kws = keywords(query);

  const parts: string[] = [];
  const sec = (t: string) => parts.push(`\n### ${t}`);

  // Selalu ambil: ai_settings (system prompt) + website_settings (identitas toko).
  // Keduanya baris tunggal & sangat kecil.
  const needSite = true;
  const [aiRes, site] = await Promise.all([
    sb.from("ai_settings").select("system_prompt,custom_instructions,forbidden_words").eq("id", 1).maybeSingle(),
    needSite
      ? sb.from("website_settings").select("site_name,tagline,whatsapp_number").eq("id", 1).maybeSingle()
      : Promise.resolve({ data: null } as any),
  ]);

  parts.push(`# INFO TOKO: ${site.data?.site_name ?? "The Black Prince"}`);
  if (site.data?.tagline) parts.push(site.data.tagline);
  parts.push(`(Snapshot database saat pertanyaan ini: ${new Date().toISOString()} — ini data paling baru.)`);
  if (intents.contact && site.data?.whatsapp_number) {
    parts.push(`WhatsApp admin: ${site.data.whatsapp_number}`);
  }

  // Query hanya tabel yang relevan dengan pertanyaan.
  const jobs: Promise<void>[] = [];

  if (intents.fruits) {
    jobs.push(
      (async () => {
        const { data } = await sb
          .from("fruits")
          .select("name,price,stock,ready,category")
          .order("sort_order");
        const { rows, truncated } = pickRelevant<any>(data ?? [], kws, query, intents.listAll);
        sec("KATEGORI 1 — FRUIT (item buah, dijual satuan). Hanya untuk pertanyaan FRUIT/buah.");
        if (rows.length === 0) parts.push("Belum ada fruit tersedia.");
        for (const f of rows) {
          const stok = f.ready ? (f.stock > 0 ? `stok ${f.stock}` : "ready (PO)") : "SOLD OUT";
          parts.push(`- [FRUIT] ${f.name} [${f.category ?? "-"}] — ${fmtIDR(f.price)} — ${stok}`);
        }
        if (truncated > 0) parts.push(`(+${truncated} fruit lain, minta user sebutkan namanya)`);
      })(),
    );
  }

  if (intents.joki) {
    jobs.push(
      (async () => {
        const { data } = await sb
          .from("joki_services")
          .select("name,price,estimation,description,active")
          .eq("active", true)
          .order("sort_order");
        const { rows, truncated } = pickRelevant<any>(data ?? [], kws, query, intents.listAll);
        sec("KATEGORI 2 — JASA JOKI (dikerjakan di AKUN MILIK USER). Hanya untuk pertanyaan JOKI/jasa/unlock/farming.");
        if (rows.length === 0) parts.push("Belum ada jasa joki yang aktif.");
        for (const j of rows) {
          parts.push(
            `- [JOKI] ${j.name} — ${fmtIDR(j.price)} — estimasi ${j.estimation ?? "-"}${j.description ? ` — ${j.description}` : ""}`,
          );
        }
        if (truncated > 0) parts.push(`(+${truncated} layanan joki lain, minta user sebutkan namanya)`);
      })(),
    );
  }

  if (intents.accounts) {
    jobs.push(
      (async () => {
        const { data } = await sb
          .from("accounts")
          .select("name,level,race,fruit,price,status")
          .order("sort_order");
        const { rows, truncated } = pickRelevant<any>(data ?? [], kws, query, intents.listAll);
        sec("KATEGORI 3 — AKUN SIAP PAKAI (jual akun jadi, BUKAN jasa joki). Hanya untuk pertanyaan AKUN.");
        if (rows.length === 0) parts.push("Belum ada akun tersedia.");
        for (const a of rows) {
          parts.push(
            `- [AKUN] ${a.name} — Lv ${a.level ?? "?"} — Race ${a.race ?? "?"} — Fruit ${a.fruit ?? "?"} — ${fmtIDR(a.price)} — status ${a.status}`,
          );
        }
        if (truncated > 0) parts.push(`(+${truncated} akun lain, minta user sebutkan namanya)`);
      })(),
    );
  }

  if (intents.promotions) {
    jobs.push(
      (async () => {
        const { data } = await sb
          .from("promotions")
          .select("title,discount_percent,scope,target_kind,target_category,ends_at")
          .eq("active", true)
          .order("sort_order")
          .limit(10);
        sec("Promo Aktif");
        if ((data ?? []).length === 0) parts.push("Tidak ada promo aktif.");
        for (const p of data ?? []) {
          parts.push(
            `- ${p.title} — diskon ${p.discount_percent}% — cakupan: ${p.scope}${p.target_kind ? `/${p.target_kind}` : ""}${p.target_category ? `/${p.target_category}` : ""} — berakhir: ${p.ends_at ?? "-"}`,
          );
        }
      })(),
    );
  }

  if (intents.giveaways) {
    jobs.push(
      (async () => {
        const { data } = await sb
          .from("giveaways")
          .select("name,prize,how_to_join,ends_at")
          .eq("active", true)
          .limit(10);
        sec("Giveaway Aktif");
        if ((data ?? []).length === 0) parts.push("Belum ada giveaway aktif saat ini.");
        for (const g of data ?? []) {
          parts.push(`- ${g.name} — hadiah: ${g.prize ?? "-"} — cara ikut: ${g.how_to_join ?? "-"} — deadline: ${g.ends_at ?? "-"}`);
        }
      })(),
    );
  }

  if (intents.events) {
    jobs.push(
      (async () => {
        const { data } = await sb
          .from("events")
          .select("title,description,event_date")
          .eq("active", true)
          .limit(10);
        sec("Event Aktif");
        if ((data ?? []).length === 0) parts.push("Belum ada event aktif.");
        for (const e of data ?? []) parts.push(`- ${e.title} — ${e.description ?? ""} — ${e.event_date ?? ""}`);
      })(),
    );
  }

  if (intents.live) {
    jobs.push(
      (async () => {
        const { data } = await sb
          .from("live_status")
          .select("is_live,title,live_time,link,ai_message")
          .eq("id", 1)
          .maybeSingle();
        sec("Status Live TikTok");
        if (data?.is_live) {
          parts.push(`SEDANG LIVE 🔴 — ${data.title ?? ""} — ${data.live_time ?? ""} — link: ${data.link ?? "-"}`);
          if (data.ai_message) parts.push(`Pesan admin saat live: ${data.ai_message}`);
        } else {
          parts.push("Admin sedang TIDAK live saat ini.");
        }
      })(),
    );
  }

  if (intents.faqs) {
    jobs.push(
      (async () => {
        const { data } = await sb.from("faqs").select("question,answer").order("sort_order");
        const all = data ?? [];
        let picked = all;
        if (!intents.listAll && kws.length > 0) {
          const scored = all
            .map((q: any) => {
              const hay = squash(`${q.question} ${q.answer}`);
              let s = 0;
              for (const k of kws) {
                const ks = squash(k);
                if (ks.length >= 3 && hay.includes(ks)) s += 1;
              }
              return { q, s };
            })
            .filter((x) => x.s > 0)
            .sort((a, b) => b.s - a.s)
            .slice(0, 4)
            .map((x) => x.q);
          if (scored.length > 0) picked = scored;
          else picked = all.slice(0, 4);
        } else {
          picked = all.slice(0, 6);
        }
        sec("FAQ");
        if (picked.length === 0) parts.push("Belum ada FAQ.");
        for (const q of picked) parts.push(`Q: ${q.question}\nA: ${q.answer}`);
      })(),
    );
  }

  if (intents.community) {
    jobs.push(
      (async () => {
        const { data } = await sb
          .from("community_links")
          .select("platform,label,url")
          .eq("active", true)
          .order("sort_order")
          .limit(12);
        sec("Link Komunitas & Sosial");
        if ((data ?? []).length === 0) parts.push("Belum ada link komunitas.");
        for (const c of data ?? []) parts.push(`- ${c.label} (${c.platform}): ${c.url}`);
      })(),
    );
  }

  if (intents.announcements) {
    jobs.push(
      (async () => {
        const { data } = await sb.from("announcements").select("message").eq("active", true).limit(5);
        sec("Pengumuman Aktif");
        if ((data ?? []).length === 0) parts.push("Tidak ada pengumuman aktif.");
        for (const a of data ?? []) parts.push(`- ${a.message}`);
      })(),
    );
  }

  await Promise.all(jobs);

  const settings = aiRes.data;
  const sys = [
    settings?.system_prompt ?? "",
    settings?.custom_instructions ? `\nInstruksi tambahan: ${settings.custom_instructions}` : "",
    settings?.forbidden_words
      ? `\nJangan pernah menggunakan atau membahas kata/topik ini: ${settings.forbidden_words}`
      : "",
    "\n\nATURAN DATA (WAJIB):\n" +
      "1. Data di bawah baru saja di-query langsung dari database dan merupakan satu-satunya sumber kebenaran.\n" +
      "2. ABAIKAN semua harga, stok, estimasi, status live, promo, atau info lain yang pernah kamu sebutkan di pesan sebelumnya dalam percakapan ini jika berbeda dengan data di bawah.\n" +
      "3. Jika data berubah dibanding jawaban sebelumnya, gunakan data terbaru ini dan boleh sebutkan bahwa datanya baru diperbarui.\n" +
      "4. Jangan mengarang data yang tidak ada di bawah. Data di bawah hanya berisi bagian yang relevan dengan pertanyaan user; kalau user menanyakan topik lain, minta user menyebutkan nama/topiknya dengan jelas.\n" +
      "5. JANGAN PERNAH MENCAMPUR KATEGORI. Item [FRUIT], [JOKI], dan [AKUN] adalah produk yang benar-benar berbeda walaupun namanya mirip.\n" +
      "   - User tanya JOKI (contoh: \"joki god human berapa\") -> jawab HANYA dari daftar [JOKI]. Dilarang menyebut item [AKUN] atau [FRUIT].\n" +
      "   - User tanya AKUN -> jawab HANYA dari daftar [AKUN].\n" +
      "   - User tanya FRUIT -> jawab HANYA dari daftar [FRUIT].\n" +
      "6. Kalau item yang ditanya tidak ada di kategori tersebut, katakan terus terang belum tersedia di kategori itu. Baru setelah itu boleh menawarkan alternatif dari kategori lain dengan menyebut jelas kategorinya.\n" +
      "7. PENCOCOKAN NAMA HARUS FLEKSIBEL (WAJIB). Sebelum bilang 'tidak ada', cocokkan nama yang user sebut dengan seluruh daftar di kategori tersebut dengan cara:\n" +
      "   - abaikan huruf besar/kecil, spasi, tanda hubung, dan typo kecil (godhuman = god human = God-Human = gudhuman)\n" +
      "   - abaikan kata pembuka layanan seperti 'joki', 'jasa', 'get', 'unlock', 'beli', 'harga', 'buka'\n" +
      "   - anggap COCOK kalau nama inti user terkandung di dalam nama item, atau sebaliknya (contoh: user tanya 'joki godhuman' -> item [JOKI] 'Get Godhuman' ADALAH item yang dimaksud)\n" +
      "   - kenali singkatan/alias umum Blox Fruits: gh = godhuman, cdk = Cursed Dual Katana, sc = Superhuman/Soul Cane sesuai daftar, v4 = race v4, sm = Sharkman Karate, ek = Electric Claw, dm = Dark Mode.\n" +
      "8. Kalau sudah ketemu item yang cocok, LANGSUNG jawab harga/estimasi/stoknya. JANGAN bertanya balik 'apakah ini yang Anda cari?' dan jangan bilang tidak menemukan dulu.\n" +
      "9. Jawab langsung dan singkat. DILARANG menulis proses berpikirmu (contoh: 'saya perlu mencari...', 'bisa saya lihat di database...'). Langsung ke jawaban akhir.\n\n",

    parts.join("\n"),
  ].join("");

  return sys;
}

async function saveChatSession(sb: ReturnType<typeof serverSb>, sessionKey: string) {
  const { error } = await sb.rpc("upsert_chat_session", { p_session_key: sessionKey });
  if (error) console.error("upsert_chat_session RPC failed:", error);
}

async function saveChatMessage(
  sb: ReturnType<typeof serverSb>,
  sessionKey: string,
  role: string,
  content: string,
) {
  const { error } = await sb.rpc("insert_chat_message", {
    p_session_key: sessionKey,
    p_role: role,
    p_content: content,
  });
  if (error) console.error("insert_chat_message RPC failed:", error);
}

// Hanya kirim maksimal 10 pesan terakhir ke model.
const MAX_HISTORY = 10;

export const chatWithAssistant = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return { ok: false as const, error: "GROQ_API_KEY belum dikonfigurasi." };
    }

    const sb = serverSb();
    const aiRes = await sb.from("ai_settings").select("model").eq("id", 1).maybeSingle();
    const model = aiRes.data?.model || "llama-3.3-70b-versatile";

    const lastUser = [...data.messages].reverse().find((m) => m.role === "user");
    const systemContext = await buildContext(lastUser?.content ?? "");

    // Persist last user message via SECURITY DEFINER RPCs.
    if (lastUser) {
      await saveChatSession(sb, data.sessionKey);
      await saveChatMessage(sb, data.sessionKey, "user", lastUser.content);
    }

    const history = data.messages
      .filter((m) => m.role !== "system")
      .slice(-MAX_HISTORY)
      .map((m) => ({ role: m.role, content: m.content }));

    const body = {
      model,
      temperature: 0.7,
      max_tokens: 800,
      messages: [{ role: "system", content: systemContext }, ...history],
    };

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Groq error", res.status, errText);
      // Fallback: retry with reliable default model
      if (model !== "llama-3.3-70b-versatile") {
        const retry = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
          body: JSON.stringify({ ...body, model: "llama-3.3-70b-versatile" }),
        });
        if (retry.ok) {
          const j = await retry.json();
          const reply = j.choices?.[0]?.message?.content ?? "Maaf bang, coba ulangi ya.";
          await saveChatMessage(sb, data.sessionKey, "assistant", reply);
          return { ok: true as const, reply };
        }
      }
      if (res.status === 429) {
        return { ok: false as const, error: "Limit AI tercapai bang, coba lagi beberapa saat lagi ya." };
      }
      return { ok: false as const, error: "AI lagi sibuk bang, coba lagi bentar ya." };
    }

    const json = await res.json();
    const reply: string = json.choices?.[0]?.message?.content ?? "Maaf bang, coba ulangi ya.";

    await saveChatMessage(sb, data.sessionKey, "assistant", reply);

    return { ok: true as const, reply };
  });
