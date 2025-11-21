import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { articles } from "@/lib/news-data";

export default function NewsPage() {
  return (
    <div className="container mx-auto max-w-6xl p-4 md:p-8 lg:py-12">
      <div className="mb-12 text-center">
        <Badge variant="secondary" className="mb-4">
          Blog & Updates
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl mb-4">
          Latest from ZilStream
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Stay up to date with the latest features, announcements, and insights
          from the team.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article, index) => (
          <Link
            key={article.slug}
            href={`/news/${article.slug}`}
            className="group h-full"
          >
            <Card className="h-full overflow-hidden border-border/50 bg-card/50 backdrop-blur transition-all hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 flex flex-col">
              <div className="aspect-video w-full bg-muted relative overflow-hidden">
                {article.image ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 bg-gradient-to-br from-primary/5 via-zinc-950 to-primary/10 p-8">
                    <Image
                      src={article.image}
                      alt={article.title}
                      width={200}
                      height={50}
                      className="w-auto h-12 opacity-80 group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${getGradient(index)} opacity-80 group-hover:scale-105 transition-transform duration-500`}
                  />
                )}

                <div className="absolute top-4 left-4">
                  <Badge
                    variant="secondary"
                    className="bg-background/80 backdrop-blur text-xs font-medium"
                  >
                    {article.category}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-2 pt-6">
                <h2 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                  {article.title}
                </h2>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col justify-between">
                <p className="text-muted-foreground line-clamp-3 text-sm mb-6">
                  {article.excerpt}
                </p>

                <div className="flex items-center text-sm font-medium text-primary group-hover:underline">
                  Read article{" "}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function getGradient(index: number) {
  const gradients = [
    "from-blue-500/20 via-purple-500/20 to-pink-500/20",
    "from-emerald-500/20 via-teal-500/20 to-cyan-500/20",
    "from-orange-500/20 via-amber-500/20 to-yellow-500/20",
    "from-indigo-500/20 via-violet-500/20 to-purple-500/20",
  ];
  return gradients[index % gradients.length];
}
