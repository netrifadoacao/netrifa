'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { FiCheck, FiCircle, FiLoader } from 'react-icons/fi';

type StepStatus = 'pending' | 'doing' | 'done';

const STEPS = [
  { id: 'signout', label: 'Chamando signOut() no Supabase (limpa sessão e cookies)' },
  { id: 'server', label: 'Limpando sessão no servidor (POST /auth/logout)' },
  { id: 'session', label: 'Limpando Session Storage' },
  { id: 'local', label: 'Limpando Local Storage' },
  { id: 'cookies', label: 'Limpando cookies restantes' },
  { id: 'verify', label: 'Verificando se a sessão foi encerrada' },
] as const;

function clearSessionStorage(): void {
  const keys: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const k = sessionStorage.key(i);
    if (k && (k.startsWith('sb-') || k.startsWith('supabase.') || k.includes('supabase'))) keys.push(k);
  }
  keys.forEach((k) => sessionStorage.removeItem(k));
}

function clearLocalStorage(): void {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && (k.startsWith('sb-') || k.startsWith('supabase.') || k.includes('supabase'))) keys.push(k);
  }
  keys.forEach((k) => localStorage.removeItem(k));
}

function clearCookies(): void {
  const cookies = document.cookie.split(';');
  for (const c of cookies) {
    const name = c.trim().split('=')[0].trim();
    if (!name) continue;
    if (name.startsWith('sb-') || name.includes('supabase')) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
    }
  }
}

export default function LogoutPage() {
  const [stepStatus, setStepStatus] = useState<Record<string, StepStatus>>({
    signout: 'pending',
    server: 'pending',
    session: 'pending',
    local: 'pending',
    cookies: 'pending',
    verify: 'pending',
  });
  const [verifyAttempt, setVerifyAttempt] = useState(0);
  const [done, setDone] = useState(false);

  const setStep = useCallback((id: string, status: StepStatus) => {
    setStepStatus((prev) => ({ ...prev, [id]: status }));
  }, []);

  useEffect(() => {
    if (done) return;
    const supabase = createClient();

    (async () => {
      setStep('signout', 'doing');
      try {
        await Promise.race([
          supabase.auth.signOut(),
          new Promise<void>((resolve) => setTimeout(resolve, 4000)),
        ]);
      } catch (_) {}
      await new Promise((r) => setTimeout(r, 200));
      setStep('signout', 'done');

      setStep('server', 'doing');
      try {
        const res = await fetch(`${window.location.origin}/auth/logout`, { method: 'POST' });
        await res.text();
      } catch (_) {}
      await new Promise((r) => setTimeout(r, 400));
      setStep('server', 'done');

      setStep('session', 'doing');
      clearSessionStorage();
      await new Promise((r) => setTimeout(r, 200));
      setStep('session', 'done');

      setStep('local', 'doing');
      clearLocalStorage();
      await new Promise((r) => setTimeout(r, 200));
      setStep('local', 'done');

      setStep('cookies', 'doing');
      clearCookies();
      await new Promise((r) => setTimeout(r, 200));
      setStep('cookies', 'done');

      setStep('verify', 'doing');
      const maxAttempts = 6;
      for (let i = 0; i < maxAttempts; i++) {
        setVerifyAttempt(i + 1);
        try {
          const freshClient = createClient();
          const result = await Promise.race([
            freshClient.auth.getSession(),
            new Promise<{ data: { session: null } }>((resolve) => setTimeout(() => resolve({ data: { session: null } }), 1500)),
          ]);
          if (!result?.data?.session) break;
        } catch (_) {}
        await new Promise((r) => setTimeout(r, 300));
      }
      setStep('verify', 'done');
      setDone(true);
      await new Promise((r) => setTimeout(r, 400));
      window.location.href = '/login';
    })();
  }, [done, setStep]);

  return (
    <div className="min-h-screen bg-rich-black flex items-center justify-center p-6">
      <div className="w-full max-w-md glass-strong rounded-2xl border border-white/10 p-8">
        <h1 className="text-2xl font-display font-bold text-white mb-2">Encerrando sessão</h1>
        <p className="text-steel-400 text-sm mb-8">
          Aguarde enquanto limpamos seus dados e encerramos a sessão com segurança.
        </p>
        <ul className="space-y-4">
          {STEPS.map(({ id, label }) => (
            <li key={id} className="flex items-center gap-3 text-white">
              {stepStatus[id] === 'pending' && (
                <FiCircle className="w-5 h-5 flex-shrink-0 text-steel-500" />
              )}
              {stepStatus[id] === 'doing' && (
                <FiLoader className="w-5 h-5 flex-shrink-0 text-gold-400 animate-spin" />
              )}
              {stepStatus[id] === 'done' && (
                <FiCheck className="w-5 h-5 flex-shrink-0 text-emerald-400" />
              )}
              <span className={stepStatus[id] === 'done' ? 'text-steel-300' : ''}>{label}</span>
              {id === 'verify' && stepStatus[id] === 'doing' && verifyAttempt > 0 && (
                <span className="text-xs text-steel-500 ml-auto">(tentativa {verifyAttempt})</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
