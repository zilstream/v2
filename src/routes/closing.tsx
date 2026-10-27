import { createFileRoute } from "@tanstack/react-router";
import {
  CLOSING_BODY,
  CLOSING_THANKS,
  CLOSING_TITLE,
} from "@/components/closing-banner";

export const Route = createFileRoute("/closing")({
  component: ClosingPage,
});

function ClosingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <article className="flex max-w-xl flex-col items-center gap-6 text-center">
        <img
          src="/logo-text.svg"
          alt="ZilStream"
          width={140}
          height={28}
          className="block h-7 w-auto dark:hidden"
        />
        <img
          src="/logo-text-dark.svg"
          alt="ZilStream"
          width={140}
          height={28}
          className="hidden h-7 w-auto dark:block"
        />
        <div className="flex flex-col gap-4">
          <h1 className="text-balance font-semibold text-2xl leading-tight sm:text-3xl">
            {CLOSING_TITLE}
          </h1>
          <p className="text-pretty text-foreground/80 text-lg leading-relaxed sm:text-xl">
            {CLOSING_BODY}
          </p>
          <p className="text-foreground/80 text-lg sm:text-xl">
            {CLOSING_THANKS}
          </p>
        </div>
      </article>
    </main>
  );
}
