import { SubmitProductForm } from "@/components/devhunt/submit-product-form";

export default function SubmitPage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h1 className="hero-title">Launch a Product</h1>
        <p className="text-gray-600 max-w-xl">
          Present your launch to the community. Strong submissions are clear,
          specific, and show what makes your product worth trying.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <SubmitProductForm />

        <aside className="flex flex-col gap-4">
          <div className="ph-card p-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              What makes a great launch
            </h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-primary font-semibold">1.</span>
                Clear tagline that explains what your product does
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-semibold">2.</span>
                Screenshots that show the actual product experience
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-semibold">3.</span>
                Description that explains who benefits first
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-semibold">4.</span>
                Honest about what you're building and what's included
              </li>
            </ul>
          </div>

          <div className="ph-card p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Best practices</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Engage with comments on your launch day</li>
              <li>• Share your launch on social media</li>
              <li>• Be responsive to feedback</li>
              <li>• Update your product based on user input</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
