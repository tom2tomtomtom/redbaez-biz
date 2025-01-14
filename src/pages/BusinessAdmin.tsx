import { MainNav } from "@/components/ui/main-nav";

export const BusinessAdmin = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/50">
      <MainNav />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Business Administration</h1>
        <div className="grid gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600">Business administration dashboard coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
};