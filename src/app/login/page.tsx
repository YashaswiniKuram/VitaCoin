import { LoginForm } from '@/components/LoginForm';
import { VitaCoinLogo } from '@/components/icons';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-3 text-3xl font-bold font-headline group transition-all duration-200 hover:scale-105">
            <div className="relative">
              <VitaCoinLogo className="h-10 w-10 group-hover:animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-ping opacity-75"></div>
            </div>
            <span className="sr-only">VitaCoin</span>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              VitaCoin
            </span>
          </Link>
        </div>
        
        <div className="backdrop-blur-xl bg-card/50 border border-border/50 rounded-2xl shadow-2xl shadow-primary/10 p-8">
          <LoginForm />
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link 
              href="/signup" 
              className="font-semibold text-primary hover:text-primary/80 transition-colors duration-200 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 opacity-20 animate-float">
        <div className="w-4 h-4 bg-primary rounded-full"></div>
      </div>
      <div className="absolute bottom-20 right-20 opacity-20 animate-float-delayed">
        <div className="w-3 h-3 bg-accent rounded-full"></div>
      </div>
    </div>
  );
}
