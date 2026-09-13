import { useState } from 'react'
import { useApplyTheme } from '../hooks/useTheme'

/**
 * 站点管理员登录页（/login 路由）。
 * 登录成功后服务端种下 site_session + wb_session 两枚 cookie：
 * 返回首页后导航出现「工作台」入口，且 /app 免密直通。
 */
export default function LoginPage() {
  useApplyTheme()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setError(body?.message ?? '登录失败')
        setBusy(false)
        return
      }
      window.location.href = '/'
    } catch {
      setError('网络异常，稍后再试')
      setBusy(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <h1 className="login-card__title">
          管理登录<span className="login-card__dot">.</span>
        </h1>
        <p className="login-card__hint">只给一个人看的地方。</p>

        <label className="login-field">
          <span>账号</span>
          <input
            value={username}
            autoComplete="username"
            onChange={(event) => setUsername(event.target.value)}
          />
        </label>
        <label className="login-field">
          <span>密码</span>
          <input
            type="password"
            value={password}
            autoComplete="current-password"
            autoFocus
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {error && <p className="login-card__error">{error}</p>}

        <button className="login-card__submit" type="submit" disabled={busy}>
          {busy ? '验证中…' : '进入'}
        </button>
        <a className="login-card__back" href="/">
          ← 回首页
        </a>
      </form>
    </div>
  )
}
