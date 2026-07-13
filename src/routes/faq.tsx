import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/site-layout";
import { faqsQO } from "@/lib/site-queries";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — The Black Prince" },
      { name: "description", content: "Pertanyaan yang sering diajukan seputar pembelian Blox Fruits di The Black Prince." },
      { property: "og:title", content: "FAQ Blox Fruits" },
      { property: "og:description", content: "Tanya jawab pembelian, joki, PS, dan komunitas." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(faqsQO),
  component: FaqPage,
});

function FaqPage() {
  const faqs = useQuery(faqsQO).data ?? [];
  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-3xl font-black">
          <span className="text-gradient">FAQ</span>
        </h1>
        <p className="text-sm text-muted-foreground">Pertanyaan yang sering ditanya.</p>

        <Accordion type="single" collapsible className="mt-6 space-y-2">
          {faqs.map((f: any) => (
            <AccordionItem
              key={f.id}
              value={f.id}
              className="rounded-2xl border border-border bg-card px-4"
            >
              <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline">
                {f.question}
              </AccordionTrigger>
              <AccordionContent className="whitespace-pre-line text-sm text-muted-foreground">
                {f.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </SiteLayout>
  );
}
