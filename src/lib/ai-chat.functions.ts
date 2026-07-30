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

async function buildContext(): Promise<string> {
  const sb = serverSb();
  const [
    fruits,
    joki,
    accounts,
    community,
    liveRes,
    giveaways,
    events,
    faqs,
    aiRes,
    site,
    announcements,
    promotions,
  ] = await Promise.all([
    sb.from("fruits").select("name,price,price_rm,stock,ready,category,description").order("sort_order"),
    sb.from("joki_services").select("name,price,price_rm,description,estimation,active,stock,category").order("sort_order"),
    sb.from("accounts").select("name,level,race,fruit,price,price_rm,status,description").order("sort_order"),
    sb.from("community_links").select("platform,label,url,active").eq("active", true).order("sort_order"),
    sb.from("live_status").select("*").eq("id", 1).maybeSingle(),
    sb.from("giveaways").select("name,description,prize,how_to_join,ends_at,active").eq("active", true),
    sb.from("events").select("title,description,event_date,active").eq("active", true),
    sb.from("faqs").select("question,answer").order("sort_order"),
    sb.from("ai_settings").select("*").eq("id", 1).maybeSingle(),
    sb.from("website_settings").select("*").eq("id", 1).maybeSingle(),
    sb.from("announcements").select("message,active").eq("active", true),
    sb
      .from("promotions")
      .select("title,subtitle,discount_percent,scope,target_kind,target_category,starts_at,ends_at,active")
      .eq("active", true)
      .order("sort_order"),
  ]);

  const parts: string[] = [];

  const sec = (t: string) => parts.push(`\n### ${t}`);

  parts.push(`# INFO TOKO: ${site.data?.site_name ?? "The Black Prince"}`);
  parts.push(site.data?.tagline ?? "");
  parts.push(
    `(Snapshot database diambil langsung saat pertanyaan ini: ${new Date().toISOString()} — ini data paling baru.)`,
  );
  if (site.data?.whatsapp_number) parts.push(`WhatsApp admin: ${site.data.whatsapp_number}`);


  sec("KATEGORI 1 — FRUIT (item buah, dijual satuan). Hanya pakai bagian ini kalau user tanya FRUIT/buah.");
  for (const f of fruits.data ?? []) {
    const stok = f.ready ? (f.stock > 0 ? `stok ${f.stock}` : "ready (PO)") : "SOLD OUT";
    parts.push(`- [FRUIT] ${f.name} [${f.category ?? "-"}] — ${fmtIDR(f.price)} — ${stok}`);
  }

  sec("KATEGORI 2 — JASA JOKI (layanan pengerjaan di AKUN MILIK USER SENDIRI). Hanya pakai bagian ini kalau user tanya JOKI/jasa/unlock/farming.");
  for (const j of joki.data ?? []) {
    if (!j.active) continue;
    parts.push(
      `- [JOKI] ${j.name} — ${fmtIDR(j.price)} — estimasi ${j.estimation ?? "-"} — ${j.description ?? ""}`,
    );
  }
  if ((joki.data ?? []).filter((j: any) => j.active).length === 0) {
    parts.push("Belum ada jasa joki yang aktif.");
  }

  sec("KATEGORI 3 — AKUN SIAP PAKAI (jual akun jadi, BUKAN jasa joki). Hanya pakai bagian ini kalau user tanya AKUN.");
  for (const a of accounts.data ?? []) {
    parts.push(
      `- [AKUN] ${a.name} — Lv ${a.level ?? "?"} — Race ${a.race ?? "?"} — Fruit ${a.fruit ?? "?"} — ${fmtIDR(a.price)} — status ${a.status} — ${a.description ?? ""}`,
    );
  }

  sec("Link Komunitas & Sosial");
  for (const c of community.data ?? []) {
    parts.push(`- ${c.label} (${c.platform}): ${c.url}`);
  }

  sec("Status Live TikTok");
  if (liveRes.data?.is_live) {
    parts.push(
      `SEDANG LIVE 🔴 — ${liveRes.data.title ?? ""} — ${liveRes.data.live_time ?? ""} — link: ${liveRes.data.link ?? "-"}`,
    );
    if (liveRes.data.ai_message) parts.push(`Pesan admin saat live: ${liveRes.data.ai_message}`);
  } else {
    parts.push("Admin sedang TIDAK live saat ini.");
  }

  sec("Giveaway Aktif");
  if ((giveaways.data ?? []).length === 0) parts.push("Belum ada giveaway aktif saat ini.");
  for (const g of giveaways.data ?? []) {
    parts.push(`- ${g.name} — hadiah: ${g.prize ?? "-"} — cara ikut: ${g.how_to_join ?? "-"} — deadline: ${g.ends_at ?? "-"}`);
  }

  sec("Event Aktif");
  if ((events.data ?? []).length === 0) parts.push("Belum ada event aktif.");
  for (const e of events.data ?? []) {
    parts.push(`- ${e.title} — ${e.description ?? ""} — ${e.event_date ?? ""}`);
  }

  sec("Pengumuman Aktif");
  if ((announcements.data ?? []).length === 0) parts.push("Tidak ada pengumuman aktif.");
  for (const a of announcements.data ?? []) parts.push(`- ${a.message}`);

  sec("Promo Aktif");
  if ((promotions.data ?? []).length === 0) parts.push("Tidak ada promo aktif.");
  for (const p of promotions.data ?? []) {
    parts.push(
      `- ${p.title} — diskon ${p.discount_percent}% — cakupan: ${p.scope}${p.target_kind ? `/${p.target_kind}` : ""}${p.target_category ? `/${p.target_category}` : ""} — berakhir: ${p.ends_at ?? "-"}`,
    );
  }

  sec("FAQ");
  for (const q of faqs.data ?? []) {
    parts.push(`Q: ${q.question}\nA: ${q.answer}`);
  }

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
      "4. Jangan mengarang data yang tidak ada di bawah.\n" +
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

    const systemContext = await buildContext();

    // Persist last user message via SECURITY DEFINER RPCs — see
    // chat_rpc_migration.sql. These bypass whatever was rejecting anon-role
    // direct table writes with 42501.
    const lastUser = [...data.messages].reverse().find((m) => m.role === "user");
    if (lastUser) {
      await saveChatSession(sb, data.sessionKey);
      await saveChatMessage(sb, data.sessionKey, "user", lastUser.content);
    }

    const body = {
      model,
      temperature: 0.7,
      max_tokens: 800,
      messages: [
        { role: "system", content: systemContext },
        ...data.messages.map((m) => ({ role: m.role, content: m.content })),
      ],
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
      return { ok: false as const, error: "AI lagi sibuk bang, coba lagi bentar ya." };
    }

    const json = await res.json();
    const reply: string = json.choices?.[0]?.message?.content ?? "Maaf bang, coba ulangi ya.";

    await saveChatMessage(sb, data.sessionKey, "assistant", reply);

    return { ok: true as const, reply };
  });