import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useI18n } from '../i18n/useI18n';

export default function TokenInputPage() {
  const { t } = useI18n();

  useEffect(() => {
    document.title = t('token.documentTitleDefault');
  }, [t]);

  const [refreshToken, setRefreshToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setupAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await setupAuth(refreshToken);
      navigate('/history');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('token.authFailedFallback'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative geometric shapes */}
      <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-white/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-2xl w-full bg-white rounded-2xl p-10 md:p-16 relative z-10 border-b-[12px] border-muted">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-primary mb-2 tracking-tighter italic uppercase">Pixvel</h1>
          <p className="text-foreground/40 font-black uppercase tracking-widest text-lg">{t('token.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="refreshToken" className="block text-xs font-black text-foreground/40 mb-3 uppercase tracking-widest">
              Refresh Token
            </label>
            <textarea
              id="refreshToken"
              value={refreshToken}
              onChange={(e) => setRefreshToken(e.target.value)}
              placeholder={t('token.placeholder')}
              className="w-full h-32 px-6 py-4 bg-muted border-none rounded-xl font-bold focus:ring-4 focus:ring-primary/20 transition-all resize-none text-lg"
              required
            />
          </div>

          {error && (
            <div className="bg-accent/10 border-l-8 border-accent p-4 text-accent font-black text-sm uppercase tracking-tight rounded-r-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !refreshToken.trim()}
            className="w-full h-16 bg-primary text-white py-4 px-10 rounded-xl font-black hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all text-xl uppercase tracking-widest"
          >
            {loading ? t('token.submitting') : t('token.submit')}
          </button>
        </form>

        <div className="mt-10 p-8 bg-muted rounded-xl">
          <h3 className="text-sm font-black text-foreground mb-4 uppercase tracking-widest">{t('token.helpTitle')}</h3>
          <ol className="text-sm text-foreground/60 space-y-2 list-decimal list-inside font-bold">
            <li>{t('token.step1')}</li>
            <li>{t('token.step2')}</li>
            <li>{t('token.step3')}</li>
            <li>{t('token.step4')}</li>
          </ol>
          <div className="mt-6 pt-6 border-t-2 border-white/50">
            <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] leading-tight">
              {t('token.securityNote')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
