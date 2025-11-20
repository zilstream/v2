import { ArrowLeft, Calendar, Tag } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { articles } from "@/lib/news-data";

export function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative w-full bg-muted/30 border-b border-border/50">
        <div className="absolute inset-0 bg-grid-slate-200/20 [mask-image:linear-gradient(0deg,transparent,black)] dark:bg-grid-slate-800/20" />
        <div className="container mx-auto max-w-4xl px-4 pt-12 pb-12 md:pt-20 md:pb-16 relative">
          <Button
            variant="ghost"
            asChild
            className="mb-8 -ml-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Link href="/news">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to News
            </Link>
          </Button>

          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-wrap gap-3 items-center">
              <Badge
                variant="secondary"
                className="text-sm px-3 py-1 border-primary/20 bg-primary/5 text-primary"
              >
                <Tag className="mr-1 h-3 w-3" />
                {article.category}
              </Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1 h-3 w-3" />
                {article.date}
              </div>
            </div>

            <h1 className="text-4xl font-bold tracking-tight lg:text-6xl text-foreground leading-[1.1]">
              {article.title}
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
              {article.excerpt}
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
        <article
          className="prose prose-lg prose-slate dark:prose-invert max-w-none 
          prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
          prose-h1:mb-8 prose-h2:mt-12 prose-h2:mb-6 prose-h3:mt-8 prose-h3:mb-4
          prose-p:leading-relaxed prose-p:my-6 prose-p:text-foreground/90
          prose-li:my-2 prose-ul:my-6 prose-ol:my-6
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
          prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
          prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-code:font-medium
          prose-strong:text-foreground prose-strong:font-bold
        "
        >
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Trusted content from static data */}
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </article>

        <hr className="my-12 border-border" />

        <div className="flex justify-between items-center">
          <Link
            href="/news"
            className="text-muted-foreground hover:text-foreground transition-colors font-medium inline-flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            More Articles
          </Link>
        </div>
      </div>
    </div>
  );
}
