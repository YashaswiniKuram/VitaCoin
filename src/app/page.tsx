import Dashboard from '@/components/Dashboard';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Hero Section for non-authenticated users */}
      <div className="relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 opacity-20 animate-float">
          <div className="w-4 h-4 bg-primary rounded-full"></div>
        </div>
        <div className="absolute bottom-20 right-20 opacity-20 animate-float-delayed">
          <div className="w-3 h-3 bg-accent rounded-full"></div>
        </div>
        <div className="absolute top-1/3 right-1/4 opacity-15 animate-float">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
        </div>
        
        <Dashboard />
      </div>
    </div>
  );
}
