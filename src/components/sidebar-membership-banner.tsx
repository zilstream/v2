import { ZilStreamLogo } from "@/components/zilstream-logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function SidebarMembershipBanner() {
  return (
    <Card className="mx-2 mb-2 border-primary/20 bg-gradient-to-br from-primary/10 to-transparent shadow-none p-0 gap-0">
      <div className="p-4">
        <div className="mb-1.5 flex items-center gap-2 text-sm font-bold text-primary">
          <ZilStreamLogo className="h-4 w-4" />
          ZilStream Membership
        </div>
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
          Acquire your yearly membership with STREAM
        </p>
        <Button
          size="sm"
          className="h-7 w-full bg-primary text-xs font-medium text-primary-foreground shadow-none hover:bg-primary/90"
          disabled
        >
          Coming soon
        </Button>
      </div>
    </Card>
  );
}
