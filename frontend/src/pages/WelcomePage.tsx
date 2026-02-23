import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/useI18n';

export default function WelcomePage() {
  const { t } = useI18n();

  useEffect(() => {
    document.title = t('welcome.documentTitleDefault');
  }, [t]);
  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6 overflow-hidden relative">
      {/* Decorative geometric shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-accent/20 rounded-lg rotate-12"></div>
      
      <div className="max-w-2xl w-full bg-white rounded-2xl p-12 md:p-20 text-center relative z-10 border-b-[12px] border-muted">
        <h1 className="text-6xl md:text-8xl font-black text-primary mb-6 tracking-tighter uppercase italic">
          Pixvel
        </h1>
        <p className="text-foreground/40 mb-12 text-xl md:text-2xl font-black uppercase tracking-widest leading-tight">
          {t('welcome.subtitle')}<br />{t('welcome.subtitleLine2')}
        </p>
        
        <Link
          to="/setup"
          className="block w-full h-20 flex items-center justify-center bg-primary text-white py-4 px-10 rounded-xl font-black hover:scale-105 active:scale-95 transition-all text-xl md:text-2xl uppercase tracking-widest"
        >
          {t('welcome.start')}
        </Link>
      </div>
    </div>
  );
}
