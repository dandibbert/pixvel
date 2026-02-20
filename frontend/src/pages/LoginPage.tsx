export default function LoginPage() {
  const handleLogin = () => {
    // OAuth login will be implemented later
    window.location.href = '/api/auth/pixiv'
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <div className="max-w-xl w-full bg-white rounded-2xl p-10 md:p-16 border-b-[10px] border-muted">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-foreground mb-4 tracking-tighter italic">
            PixNovel
          </h1>
          <p className="text-foreground/40 font-black uppercase tracking-widest text-lg">
            优雅的 Pixiv 小说阅读体验
          </p>
        </div>

        <div className="space-y-6">
          <button
            onClick={handleLogin}
            className="w-full h-20 flex items-center justify-center px-10 bg-primary text-white text-xl font-black rounded-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
          >
            使用 Pixiv 账号登录
          </button>

          <p className="text-sm font-bold text-foreground/30 text-center uppercase tracking-wider">
            登录即表示您同意我们的服务条款和隐私政策
          </p>
        </div>
      </div>
    </div>
  )
}
