import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function TokenInputPage() {
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
      setError(err instanceof Error ? err.message : 'Authentication failed');
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
          <h1 className="text-5xl font-black text-primary mb-2 tracking-tighter italic uppercase">PixNovel</h1>
          <p className="text-foreground/40 font-black uppercase tracking-widest text-lg">配置你的 Pixiv Refresh Token</p>
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
              placeholder="粘贴你的 Pixiv refresh_token"
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
            {loading ? '验证中...' : '开始使用'}
          </button>
        </form>

        <div className="mt-10 p-8 bg-muted rounded-xl">
          <h3 className="text-sm font-black text-foreground mb-4 uppercase tracking-widest">如何获取 Refresh Token？</h3>
          <ol className="text-sm text-foreground/60 space-y-2 list-decimal list-inside font-bold">
            <li>使用 Pixiv 官方移动应用登录</li>
            <li>使用抓包工具（如 Charles、mitmproxy）</li>
            <li>找到 OAuth token 请求中的 refresh_token</li>
            <li>复制并粘贴到上方输入框</li>
          </ol>
          <div className="mt-6 pt-6 border-t-2 border-white/50">
            <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] leading-tight">
              注意：refresh_token 是敏感信息，请妥善保管。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
