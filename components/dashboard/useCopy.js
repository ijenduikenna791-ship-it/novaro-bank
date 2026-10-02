'use client';
import { useBank } from './BankProvider';

export function useCopy() {
  const { toast } = useBank();
  return async (text, label = 'Copied') => {
    try {
      await navigator.clipboard.writeText(text);
      toast(label);
    } catch {
      toast('Could not copy', 'error');
    }
  };
}
