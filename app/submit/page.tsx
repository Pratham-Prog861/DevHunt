import { SubmitProductForm } from "@/components/devhunt/submit-product-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function SubmitPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 lg:gap-10">
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden border-none bg-[linear-gradient(135deg,rgba(26,30,51,0.96),rgba(59,73,153,0.92)_58%,rgba(192,153,69,0.72)_160%)] text-white">
          <CardContent className="flex flex-col gap-6 p-7 md:p-10">
            <Badge className="w-fit border-white/20 bg-white/10 text-white">
              Founder submission
            </Badge>
            <div className="flex flex-col gap-4">
              <h1 className="hero-title max-w-4xl text-white">
                Present your launch like a builder who knows what other builders need.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-white/76">
                Strong submissions are clear, specific, and credible. Explain the
                problem, the audience, and what makes your product worth opening in the
                first place.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="editorial-panel">
          <CardContent className="grid h-full gap-4 p-7">
            <div className="rounded-[1.6rem] border border-border/70 bg-background/70 p-5">
              <p className="eyebrow">What performs well</p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Plain-English taglines, credible screenshots, and a description that
                explains who benefits first.
              </p>
            </div>
            <div className="rounded-[1.6rem] border border-border/70 bg-background/70 p-5">
              <p className="eyebrow">Best signal</p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                The launches that spark comments tend to be concrete, honest, and easy
                to evaluate quickly.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <SubmitProductForm />
    </div>
  );
}
