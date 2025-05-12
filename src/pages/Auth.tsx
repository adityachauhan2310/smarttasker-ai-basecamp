import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useCallback, memo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { useDemo } from "@/contexts/DemoContext";

// Memoized form components to prevent unnecessary re-renders
const SignInForm = memo(({ 
  email, 
  password, 
  onEmailChange, 
  onPasswordChange, 
  onSubmit, 
  onForgotPassword,
  isLoading 
}: {
  email: string;
  password: string;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
  isLoading: boolean;
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signin-email">Email</Label>
        <Input 
          id="signin-email" 
          type="email" 
          placeholder="you@example.com"
          value={email}
          onChange={onEmailChange}
          required
          disabled={isLoading}
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="signin-password">Password</Label>
          <Button 
            type="button" 
            variant="link" 
            size="sm" 
            className="text-xs"
            onClick={onForgotPassword}
            disabled={isLoading}
          >
            Forgot password?
          </Button>
        </div>
        <div className="relative">
          <Input 
            id="signin-password" 
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={onPasswordChange}
            required
            disabled={isLoading}
            autoComplete="current-password"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
});

SignInForm.displayName = "SignInForm";

const SignUpForm = memo(({ 
  email, 
  password, 
  onEmailChange, 
  onPasswordChange, 
  onSubmit, 
  isLoading 
}: {
  email: string;
  password: string;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input 
          id="signup-email" 
          type="email" 
          placeholder="you@example.com"
          value={email}
          onChange={onEmailChange}
          required
          disabled={isLoading}
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <div className="relative">
          <Input 
            id="signup-password" 
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={onPasswordChange}
            required
            disabled={isLoading}
            autoComplete="new-password"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing up..." : "Sign Up"}
      </Button>
    </form>
  );
});

SignUpForm.displayName = "SignUpForm";

const WelcomeView = memo(({ onGetStarted, onViewDemo }: { 
  onGetStarted: () => void; 
  onViewDemo: () => void; 
}) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle className="text-2xl text-center">Welcome to SmartTasker</CardTitle>
      <CardDescription className="text-center text-lg">
        Your AI-powered task management solution
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <Button 
        onClick={onGetStarted} 
        className="w-full text-lg py-6"
        size="lg"
      >
        Get Started
      </Button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">or</span>
        </div>
      </div>
      <Button 
        variant="outline" 
        onClick={onViewDemo}
        className="w-full text-lg py-6"
        size="lg"
      >
        View Demo
      </Button>
    </CardContent>
    <CardFooter className="flex justify-center">
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        Experience the future of task management with our AI-powered platform. 
        Try the demo or create an account to get started.
      </p>
    </CardFooter>
  </Card>
));

WelcomeView.displayName = "WelcomeView";

const AuthForm = memo(({ 
  signInEmail, 
  signInPassword, 
  signUpEmail, 
  signUpPassword,
  onSignInEmailChange,
  onSignInPasswordChange,
  onSignUpEmailChange,
  onSignUpPasswordChange,
  onSignIn,
  onSignUp,
  onGoogleSignIn,
  onForgotPassword,
  onBack,
  isLoading
}: {
  signInEmail: string;
  signInPassword: string;
  signUpEmail: string;
  signUpPassword: string;
  onSignInEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSignInPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSignUpEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSignUpPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSignIn: (e: React.FormEvent) => void;
  onSignUp: (e: React.FormEvent) => void;
  onGoogleSignIn: () => void;
  onForgotPassword: () => void;
  onBack: () => void;
  isLoading: boolean;
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-2xl text-center">Welcome</CardTitle>
      <CardDescription className="text-center">
        Sign in or create an account to continue
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="signin">
          <SignInForm
            email={signInEmail}
            password={signInPassword}
            onEmailChange={onSignInEmailChange}
            onPasswordChange={onSignInPasswordChange}
            onSubmit={onSignIn}
            onForgotPassword={onForgotPassword}
            isLoading={isLoading}
          />
        </TabsContent>
        <TabsContent value="signup">
          <SignUpForm
            email={signUpEmail}
            password={signUpPassword}
            onEmailChange={onSignUpEmailChange}
            onPasswordChange={onSignUpPasswordChange}
            onSubmit={onSignUp}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
      
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      
      <Button 
        type="button" 
        variant="outline" 
        className="w-full"
        onClick={onGoogleSignIn}
        disabled={isLoading}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
          <path d="M1 1h22v22H1z" fill="none" />
        </svg>
        Google
      </Button>
    </CardContent>
    <CardFooter className="flex flex-col space-y-4 items-center">
      <Button 
        variant="ghost" 
        className="text-sm text-muted-foreground"
        onClick={onBack}
        disabled={isLoading}
      >
        ← Back to welcome screen
      </Button>
    </CardFooter>
  </Card>
));

AuthForm.displayName = "AuthForm";

const Auth = () => {
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword, signInWithGoogle } = useAuth();
  const { setDemoMode } = useDemo();
  const { toast } = useToast();
  
  const handleSignInEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSignInEmail(e.target.value);
  }, []);

  const handleSignInPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSignInPassword(e.target.value);
  }, []);

  const handleSignUpEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSignUpEmail(e.target.value);
  }, []);

  const handleSignUpPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSignUpPassword(e.target.value);
  }, []);

  const handleShowAuthForm = useCallback(() => {
    setShowAuthForm(true);
  }, []);

  const handleHideAuthForm = useCallback(() => {
    setShowAuthForm(false);
  }, []);
  
  const handleSignIn = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(signInEmail, signInPassword);
      // Request notification permission after successful login
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
      navigate('/dashboard');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error signing in",
        description: error instanceof Error ? error.message : "Please check your credentials and try again"
      });
    } finally {
      setIsLoading(false);
    }
  }, [signIn, signInEmail, signInPassword, navigate, toast]);

  const handleSignUp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signUp(signUpEmail, signUpPassword);
      // Request notification permission after successful signup
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
      navigate('/dashboard');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error signing up",
        description: error instanceof Error ? error.message : "Please check your information and try again"
      });
    } finally {
      setIsLoading(false);
    }
  }, [signUp, signUpEmail, signUpPassword, navigate, toast]);

  const handleForgotPassword = useCallback(async () => {
    if (!signInEmail) {
      setShowForgotPassword(true);
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(signInEmail);
      toast({
        title: "Check your email",
        description: "We've sent you a password reset link.",
      });
      setShowForgotPassword(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send reset email",
      });
    } finally {
      setIsLoading(false);
    }
  }, [resetPassword, signInEmail, toast]);

  const handleGoogleSignIn = useCallback(async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      // Request notification permission after successful Google sign-in
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error signing in with Google",
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  }, [signInWithGoogle, toast]);

  const handleViewDemo = useCallback(() => {
    setDemoMode(true);
    navigate('/dashboard', { replace: true });
  }, [navigate, setDemoMode]);

  return (
    <div className="container relative min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        {showAuthForm ? (
          showForgotPassword ? (
            <Card>
              <CardHeader>
                <CardTitle>Reset Password</CardTitle>
                <CardDescription>
                  Enter your email address and we'll send you a link to reset your password.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleForgotPassword(); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-password-email">Email</Label>
                    <Input
                      id="forgot-password-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowForgotPassword(false)}
                  disabled={isLoading}
                >
                  ← Back to Sign In
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <AuthForm
              signInEmail={signInEmail}
              signInPassword={signInPassword}
              signUpEmail={signUpEmail}
              signUpPassword={signUpPassword}
              onSignInEmailChange={handleSignInEmailChange}
              onSignInPasswordChange={handleSignInPasswordChange}
              onSignUpEmailChange={handleSignUpEmailChange}
              onSignUpPasswordChange={handleSignUpPasswordChange}
              onSignIn={handleSignIn}
              onSignUp={handleSignUp}
              onGoogleSignIn={handleGoogleSignIn}
              onForgotPassword={handleForgotPassword}
              onBack={handleHideAuthForm}
              isLoading={isLoading}
            />
          )
        ) : (
          <WelcomeView
            onGetStarted={handleShowAuthForm}
            onViewDemo={handleViewDemo}
          />
        )}
      </div>
    </div>
  );
};

export default Auth;
