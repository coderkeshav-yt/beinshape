import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to check if an error is due to RLS policy restrictions
export function isRLSPolicyError(error: any): boolean {
  if (!error) return false;
  
  // Check for common RLS policy error codes and messages
  const errorCode = error.code;
  const errorMessage = error.message?.toLowerCase() || '';
  
  return (
    errorCode === 'PGRST116' || // Permission denied
    errorCode === '42501' || // Insufficient privilege
    errorMessage.includes('permission denied') ||
    errorMessage.includes('insufficient privilege') ||
    errorMessage.includes('row-level security policy')
  );
}

// Utility function to handle Supabase errors gracefully
export function handleSupabaseError(error: any, fallbackValue: any = null) {
  if (isRLSPolicyError(error)) {
    console.log('RLS policy restricted access, using fallback value');
    return { data: fallbackValue, error: null };
  }
  
  // Re-throw other errors
  throw error;
}
