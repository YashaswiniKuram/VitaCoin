"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserData } from '@/lib/types';
import { signOut } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { LogOut, Coins, Crown, TrendingUp } from 'lucide-react';
import { VitaCoinLogo } from './icons';

type HeaderProps = {
  user: UserData;
};

export function Header({ user }: HeaderProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 flex h-20 items-center gap-4 border-b border-border/50 bg-background/95 backdrop-blur-xl px-6 md:px-8 z-50 shadow-lg shadow-primary/5">
      <nav className="flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link href="/" className="flex items-center gap-3 text-xl font-bold font-headline text-primary md:text-lg group transition-all duration-200 hover:scale-105">
          <div className="relative">
            <VitaCoinLogo className="h-8 w-8 md:h-7 md:w-7 group-hover:animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-ping opacity-75"></div>
          </div>
          <span className="sr-only">VitaCoin</span>
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            VitaCoin
          </span>
        </Link>
      </nav>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-3 lg:gap-6">
        <div className="ml-auto flex-1 sm:flex-initial">
          <div className="flex items-center gap-4">
            {/* Stats Display - Only show rank if user has one */}
            {user.rank && (
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-2 text-sm font-semibold border border-primary/20 backdrop-blur-sm">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-foreground/80">#{user.rank}</span>
                </div>
              </div>
            )}
            
            {/* Coin Balance */}
            <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-primary/20 px-4 py-2 text-sm font-semibold border border-primary/30 backdrop-blur-sm shadow-lg shadow-primary/10">
              <Coins className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-foreground/90 font-bold">{user.coins.toLocaleString()}</span>
              <span className="text-primary/70 text-xs">coins</span>
            </div>
            
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 rounded-full bg-secondary/50 px-4 py-2 backdrop-blur-sm border border-border/50">
                {user.rank === 1 && (
                  <Crown className="h-4 w-4 text-primary animate-pulse" />
                )}
                <span className="font-semibold text-foreground/90">{user.displayName}</span>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleSignOut}
                className="h-10 w-10 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all duration-200 group"
              >
                <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
