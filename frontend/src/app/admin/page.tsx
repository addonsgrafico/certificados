'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center text-slate-400 text-xs font-mono">
      Redirigiendo al panel de control...
    </div>
  );
}
