import { createFileRoute } from "@tanstack/react-router";
import { SingletonEditor } from "@/components/admin/singleton-editor";

export const Route = createFileRoute("/_authenticated/admin/ai-settings")({
  component: () => (
    <SingletonEditor
      table="ai_settings"
      title="Pengaturan AI Assistant"
      description="System prompt + instruksi menentukan gaya bicara & kepribadian AI. AI selalu membaca data database realtime."
      fields={[
        { key: "system_prompt", label: "System Prompt (kepribadian AI)", type: "textarea", required: true },
        { key: "greeting", label: "Sapaan Awal", type: "text" },
        { key: "custom_instructions", label: "Instruksi Tambahan", type: "textarea" },
        { key: "forbidden_words", label: "Kata/Topik Terlarang (pisah koma)", type: "textarea" },
        { key: "model", label: "Model Groq", type: "text", placeholder: "llama-3.3-70b-versatile" },
      ]}
    />
  ),
});
