"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Chrome } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { signUp, signInWithGoogle } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  displayName: z.string().min(3, { message: 'Display name must be at least 3 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export function SignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      await signUp(values.email, values.password, values.displayName);
      toast({
        title: 'Welcome to VitaCoin!',
        description: 'Your account has been created successfully!',
      });
      router.push('/');
    } catch (error: any) {
      let errorMessage = 'An unexpected error occurred.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      }
      toast({
        title: 'Sign Up Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: 'Successfully signed in with Google!',
        description: 'Welcome to VitaDash!',
      });
      router.push('/');
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast({
        title: 'Google Sign In Failed',
        description: error.message || 'Failed to sign in with Google. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-headline text-2xl font-bold text-foreground/90">Create an Account</h1>
        <p className="text-muted-foreground">Join VitaDash and start earning coins today!</p>
        <div className="flex items-center justify-center gap-2 mt-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <span className="text-sm font-semibold text-primary">🎉 Welcome Bonus: 500 Coins!</span>
        </div>
      </div>
      
      <Button 
        type="button" 
        variant="outline" 
        className="w-full flex items-center justify-center gap-2 py-3 border-border/50 hover:bg-accent/10 transition-colors duration-200"
        onClick={handleGoogleSignUp}
        disabled={isLoading}
      >
        <Chrome className="h-4 w-4" />
        Continue with Google
      </Button>
      
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/50"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-foreground/80">Display Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Your Name" 
                    {...field} 
                    className="h-12 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-foreground/80">Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="name@example.com" 
                    {...field} 
                    className="h-12 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-foreground/80">Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    {...field} 
                    className="h-12 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200" 
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </Button>
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              By creating an account, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}
