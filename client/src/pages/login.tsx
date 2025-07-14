import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { saveUser } from '@/lib/auth';
import { Mail, Lock } from 'lucide-react';
import bannerImage from '@assets/Banner_Creator.png';
import logoImage from '@assets/xtendcreatroslogo.png';

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  email: z.string().email('Please enter a valid email address'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters')
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      email: '',
      fullName: ''
    }
  });

  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/auth/login', data);
      const result = await response.json();

      if (result.success) {
        saveUser(result.user);
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        navigate('/');
      } else {
        toast({
          title: "Login failed",
          description: result.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/auth/register', data);
      const result = await response.json();

      if (result.success) {
        toast({
          title: "Registration successful",
          description: "Please log in with your new account",
        });
        setActiveTab('login');
        loginForm.setValue('username', data.username);
      } else {
        toast({
          title: "Registration failed",
          description: result.message || "Failed to create account",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundImage: `url(${bannerImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      {/* Logo at top */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
        <img 
          src={logoImage} 
          alt="Xtend Creators" 
          className="h-12 w-auto"
        />
      </div>

      {/* Main login form */}
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Welcome text */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-200">Sign in to your creator platform</p>
        </div>

        {/* Glass-style login form */}
        <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl">
          <CardContent className="p-8 space-y-6">
            {/* Tab selector */}
            <div className="flex bg-white/20 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'login'
                    ? 'bg-white text-gray-900'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'register'
                    ? 'bg-white text-gray-900'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Register
              </button>
            </div>

            {/* Login Form */}
            {activeTab === 'login' && (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              {...field}
                              placeholder="Username"
                              className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-gray-300 focus:border-pink-400"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-pink-300" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              {...field}
                              type="password"
                              placeholder="Password"
                              className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-gray-300 focus:border-pink-400"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-pink-300" />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-200"
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </Form>
            )}

            {/* Register Form */}
            {activeTab === 'register' && (
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Full Name"
                            className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 focus:border-pink-400"
                          />
                        </FormControl>
                        <FormMessage className="text-pink-300" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              {...field}
                              type="email"
                              placeholder="Email"
                              className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-gray-300 focus:border-pink-400"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-pink-300" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Username"
                            className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 focus:border-pink-400"
                          />
                        </FormControl>
                        <FormMessage className="text-pink-300" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              {...field}
                              type="password"
                              placeholder="Password"
                              className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-gray-300 focus:border-pink-400"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-pink-300" />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-200"
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <p className="text-white/70 text-sm">
          © 2025 Xtend Creators. All rights reserved.
        </p>
      </div>
    </div>
  );
}