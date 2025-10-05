import DashboardPage from '@/components/dashboard/dashboard-page';
import { Nav } from '@/components/nav';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-grid">
      <Nav />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <DashboardPage />
      </main>
    </div>
  );
}
