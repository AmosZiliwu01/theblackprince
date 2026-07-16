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

function serverSb() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
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
  ] = await Promise.all([
    sb.from("fruits").select("name,price,stock,ready,category").order("sort_order"),
    sb.from("joki_services").select("name,price,description,estimation,active").order("sort_order"),
    sb.from("accounts").select("name,level,race,fruit,price,status,description").order("sort_order"),
    sb.from("community_links").select("platform,label,url,active").eq("active", true).order("sort_order"),
    sb.from("live_status").select("*").eq("id", 1).maybeSingle(),
    sb.from("giveaways").select("name,description,prize,how_to_join,ends_at,active").eq("active", true),
    sb.from("events").select("title,description,event_date,active").eq("active", true),
    sb.from("faqs").select("question,answer").order("sort_order"),
    sb.from("ai_settings").select("*").eq("id", 1).maybeSingle(),
    sb.from("website_settings").select("*").eq("id", 1).maybeSingle(),
  ]);

  const parts: string[] = [];

  const sec = (t: string) => parts.push(`\n### ${t}`);

  parts.push(`# INFO TOKO: ${site.data?.site_name ?? "The Black Prince"}`);
  parts.push(site.data?.tagline ?? "");

  sec("Daftar Fruit (Blox Fruits)");
  for (const f of fruits.data ?? []) {
    const stok = f.ready ? (f.stock > 0 ? `stok ${f.stock}` : "ready (PO)") : "SOLD OUT";
    parts.push(`- ${f.name} [${f.category ?? "-"}] — ${fmtIDR(f.price)} — ${stok}`);
  }

  sec("Jasa Joki");
  for (const j of joki.data ?? []) {
    if (!j.active) continue;
    parts.push(`- ${j.name} — ${fmtIDR(j.price)} — ${j.estimation ?? ""} — ${j.description ?? ""}`);
  }

  sec("Akun Blox Fruits");
  for (const a of accounts.data ?? []) {
    parts.push(
      `- ${a.name} — Lv ${a.level ?? "?"} — Race ${a.race ?? "?"} — Fruit ${a.fruit ?? "?"} — ${fmtIDR(a.price)} — status ${a.status} — ${a.description ?? ""}`,
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
    "\n\nSelalu gunakan DATA REAL di bawah untuk menjawab harga, stok, link, status. Jangan mengarang.\n\n",
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