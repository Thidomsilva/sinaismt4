import { getConfigPageContent } from '@/ai/flows/config-page-gen-ai-help';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Nav } from '@/components/nav';
import { Bot } from 'lucide-react';

export default async function ConfigPage() {
  const content = await getConfigPageContent({});

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Nav />
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6" />
              Configuration Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{content.message}</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
