
import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    mobileNumber: '',
    state: '',
    city: '',
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    minLength: false,
  });
  
  const { user, signIn, signInWithGoogle } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const validatePassword = (password: string) => {
    const strength = {
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      minLength: password.length >= 8,
    };
    setPasswordStrength(strength);
    return Object.values(strength).every(Boolean);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setFormData({ ...formData, password });
    if (!isLogin) {
      validatePassword(password);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(error.message || 'Failed to sign in with Google');
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      toast.error('An error occurred during Google sign in');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Welcome back!');
        }
      } else {
        // Validate required fields
        if (!formData.fullName || !formData.mobileNumber || !formData.state || !formData.city) {
          toast.error('All fields are required for signup');
          setLoading(false);
          return;
        }

        // Validate password strength
        if (!validatePassword(formData.password)) {
          toast.error('Password does not meet the required criteria');
          setLoading(false);
          return;
        }
        
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: formData.fullName,
              mobile_number: formData.mobileNumber,
              state: formData.state,
              city: formData.city,
            }
          }
        });
        
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Account created successfully! Please check your email to verify your account.');
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center space-x-2 text-sm ${met ? 'text-green-600' : 'text-gray-500'}`}>
      {met ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-black dark:to-gray-900 flex items-center justify-center p-4 pt-24">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&h=1080')] bg-cover bg-center opacity-5 dark:opacity-10"></div>
      
      <Card className="w-full max-w-lg bg-white/90 dark:bg-black/90 backdrop-blur-lg border-gray-200/50 dark:border-white/20 relative z-10 shadow-2xl">
        <div className="absolute top-4 right-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-gray-600 dark:text-white hover:text-[#e3bd30]">
              <X className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-6">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-colors font-dejanire ${
                  isLogin
                    ? 'bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] text-black shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-colors font-dejanire ${
                  !isLogin
                    ? 'bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] text-black shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>
          
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white font-dejanire">
            {isLogin ? 'Welcome Back' : 'Join Be In Shape'}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300 font-dejanire text-lg">
            {isLogin ? 'Sign in to your account' : 'Create your account to get started'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300 dark:border-gray-700"></span>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-black text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e3bd30] h-12 flex items-center justify-center space-x-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
            >
              {googleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#e3bd30]" />
              ) : (
                <>
                  <div className="bg-white p-1.5 rounded-full">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.28426 53.749 C -8.52426 55.049 -9.20426 56.159 -10.1843 56.859 L -10.2043 56.859 L -6.02426 59.934 C -4.72426 58.889 -3.264 56.979 -3.264 54.529 C -3.264 53.739 -3.334 52.969 -3.454 52.239 C -3.344 52.009 -3.264 51.759 -3.264 51.509 Z"/>
                        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.80426 62.159 -6.02426 60.159 L -10.1843 56.859 C -11.4443 57.789 -13.004 58.249 -14.754 58.249 C -17.514 58.249 -19.8943 56.739 -20.8543 54.239 L -24.9843 54.239 L -25.0143 54.289 C -23.2043 58.419 -19.504 63.239 -14.754 63.239 Z"/>
                        <path fill="#FBBC05" d="M -20.8543 54.239 C -21.1243 53.539 -21.2743 52.779 -21.2743 51.999 C -21.2743 51.219 -21.1143 50.459 -20.8543 49.759 L -20.8543 45.709 L -25.0143 45.709 C -25.7843 47.139 -26.2443 48.769 -26.2443 50.509 C -26.2443 52.249 -25.7843 53.859 -25.0143 55.289 L -20.8543 54.239 Z"/>
                        <path fill="#EA4335" d="M -14.754 42.749 C -13.1143 42.719 -11.4743 43.259 -10.1843 44.139 L -6.02426 40.969 C -8.80426 38.989 -11.514 37.759 -14.754 37.759 C -19.504 37.759 -23.2043 42.579 -25.0143 46.709 L -20.8543 49.759 C -19.8943 47.259 -17.514 45.749 -14.754 45.749 C -13.004 45.749 -11.4443 46.209 -10.1843 47.139 L -6.02426 43.859 C -5.07426 43.159 -3.86426 42.739 -2.65426 42.619 C -3.334 41.769 -3.85426 40.789 -4.20426 39.709 C -4.55426 38.629 -4.73426 37.489 -4.73426 36.349 C -4.73426 35.209 -4.55426 34.069 -4.20426 32.989 C -3.86426 31.909 -3.334 30.929 -2.65426 30.079 L -10.1843 30.079 L -14.754 30.079 L -14.754 42.749 Z"/>
                      </g>
                    </svg>
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-200">Continue with Google</span>
                </>
              )}
            </Button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300 dark:border-gray-700"></span>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-black text-gray-500 dark:text-gray-400">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-900 dark:text-white font-dejanire">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="bg-white/70 dark:bg-black/70 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 h-12 font-dejanire"
                    required={!isLogin}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobileNumber" className="text-gray-900 dark:text-white font-dejanire">Mobile Number</Label>
                  <Input
                    id="mobileNumber"
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    className="bg-white/70 dark:bg-black/70 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 h-12 font-dejanire"
                    required={!isLogin}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-gray-900 dark:text-white font-dejanire">State</Label>
                    <Input
                      id="state"
                      type="text"
                      placeholder="State"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="bg-white/70 dark:bg-black/70 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 h-12 font-dejanire"
                      required={!isLogin}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-gray-900 dark:text-white font-dejanire">City</Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="bg-white/70 dark:bg-black/70 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 h-12 font-dejanire"
                      required={!isLogin}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-900 dark:text-white font-dejanire">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white/70 dark:bg-black/70 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 h-12 font-dejanire"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-900 dark:text-white font-dejanire">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handlePasswordChange}
                  className="bg-white/70 dark:bg-black/70 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 pr-12 h-12 font-dejanire"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {!isLogin && formData.password && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 font-dejanire">Password Requirements:</p>
                  <PasswordRequirement met={passwordStrength.minLength} text="At least 8 characters" />
                  <PasswordRequirement met={passwordStrength.hasUppercase} text="One uppercase letter" />
                  <PasswordRequirement met={passwordStrength.hasLowercase} text="One lowercase letter" />
                  <PasswordRequirement met={passwordStrength.hasNumber} text="One number" />
                  <PasswordRequirement met={passwordStrength.hasSpecialChar} text="One special character" />
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] hover:from-[#d4b02a] hover:to-[#e5c13a] text-black font-medium py-3 px-4 rounded-md shadow-lg transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e3bd30] h-12 mt-6"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </>
              ) : isLogin ? 'Sign In' : 'Create Account'}
            </Button>

            <div className="text-center mt-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-[#e3bd30] hover:underline font-medium focus:outline-none"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
