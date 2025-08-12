
import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff, X, Check, AlertCircle } from 'lucide-react';

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
  const [passwordStrength, setPasswordStrength] = useState({
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    minLength: false,
  });
  
  const { user, signIn } = useAuth();

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
              className="w-full bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] hover:from-[#d4a82a] hover:to-[#e6c235] text-black font-semibold h-12 text-lg shadow-lg hover:shadow-xl transition-all duration-300 font-dejanire"
              disabled={loading}
            >
              {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
