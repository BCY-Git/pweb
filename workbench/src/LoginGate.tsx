import { useState } from 'react'
import { apiPost } from './api'

// 登录门：API 层 401 是真正的锁（server/index.js 里所有 /api/* 验会话），
// 这个组件只是把"没带钥匙"的状态画出来 —— 它消失与否由后端说了算。
export default function LoginGate({ onOk }: { onOk: () => void }) {
  const [pwd, setPwd] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit() {
    if (!pwd || busy) return
    setBusy(true)
    setErr('')
    try {
      await apiPost('/login', { password: pwd })
      onOk()
    } catch (e) {
      setErr(e instanceof Error ? e.message : '登录失败')
      setPwd('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div className="sheet" style={{ width: 320, padding: '34px 34px 30px' }}>
        <div className="wordmark" style={{ fontSize: 24, marginBottom: 4 }}>工作台</div>
        <p className="small dim" style={{ margin: '0 0 22px' }}>只给一个人看的地方。</p>
        <form onSubmit={(e) => { e.preventDefault(); void submit() }}>
          {/* React 受控输入：Vue 的 v-model 在这里要 value + onChange 自己接线 */}
          <input
            type="password"
            value={pwd}
            autoFocus
            style={{ width: '100%', marginBottom: 14 }}
            placeholder="密码"
            onChange={(e) => setPwd(e.target.value)}
          />
          {err && <p className="small" style={{ color: 'var(--bad)', margin: '0 0 10px' }}>{err}</p>}
          <button className="primary" type="submit" disabled={busy || !pwd} style={{ width: '100%' }}>
            {busy ? '验证中…' : '进入'}
          </button>
        </form>
      </div>
    </div>
  )
}
