import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Nav } from '@/components/nav';
import { Settings } from 'lucide-react';

export default async function ConfigPage() {
  const message =
    'As configurações são recebidas do MT4 e gerenciadas externamente. Esta página será utilizada futuramente para exibir e analisar as configurações.';

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Nav />
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-6 w-6" />
              Gerenciamento de Configurações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{message}</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
