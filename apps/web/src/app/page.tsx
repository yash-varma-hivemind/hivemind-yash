import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background p-6 text-foreground">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-2">
          <Badge>Hivemind Internship</Badge>

          <h1 className="text-3xl font-bold">Employee Onboarding</h1>

          <p className="text-muted-foreground">
            Nx, Next.js, Tailwind CSS and shadcn/ui are working.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Project setup progress</CardTitle>

            <CardDescription>
              The API and web applications have been created successfully.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            <Progress value={70} />

            <p className="text-sm text-muted-foreground">
              The initial monorepo setup is nearly complete.
            </p>
          </CardContent>

          <CardFooter>
            <Button>Continue setup</Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}