import { useState } from 'react'
import {
  Check,
  Github,
  Globe,
  Mail,
  MessageCircle,
  MessageSquare,
  Phone,
  Rss,
  Send,
} from 'lucide-react'
import type { Profile } from '../types'
import { api } from '../api'
import { AnimatedContent } from '../components/AnimatedContent'
import { ClickSpark } from '../components/ClickSpark'
import { Magnet } from '../components/Magnet'
import { Section } from '../components/Section'
import './Contact.css'

interface ContactProps {
  profile: Profile | null
}

export function Contact({ profile }: ContactProps) {
  const [form, setForm] = useState({ name: '', email: '', content: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle',
  )
  const [errorMsg, setErrorMsg] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      await api.sendMessage({
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        content: form.content.trim(),
      })
      setStatus('success')
      setForm({ name: '', email: '', content: '' })
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : '提交失败')
    }
  }

  const channels = [
    {
      icon: Mail,
      label: '邮箱',
      value: profile?.email ?? '2097588616@qq.com',
      href: profile?.email ? `mailto:${profile.email}` : undefined,
    },
    ...(profile?.phone
      ? [{ icon: Phone, label: '电话', value: profile.phone, href: `tel:${profile.phone}` }]
      : []),
    ...(profile?.wechatId
      ? [{ icon: MessageCircle, label: '微信', value: profile.wechatId }]
      : []),
    ...(profile?.blogUrl
      ? [{ icon: Rss, label: 'CSDN 博客', value: 'Restart-AHTCM', href: profile.blogUrl }]
      : []),
    ...(profile?.githubUrl
      ? [{ icon: Github, label: 'GitHub', value: 'GitHub 主页', href: profile.githubUrl }]
      : []),
    ...(profile?.giteeUrl
      ? [{ icon: Globe, label: 'Gitee', value: 'Gitee 主页', href: profile.giteeUrl }]
      : []),
  ]

  return (
    <Section id="contact" title="联系我" subtitle="contact" tone="sand">
      <div className="contact">
        <AnimatedContent direction="right" distance={30} duration={0.5}>
          <div className="contact__info">
            <p className="contact__lead">
              有合作意向或想聊聊？欢迎通过以下方式联系我，
              或直接在右侧留言。
            </p>
            <div className="contact__channels">
              {channels.map((c) => (
                <Magnet key={c.label} strength={0.15} className="contact__magnet">
                  <a
                    href={c.href ?? '#'}
                    target={c.href?.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className={c.href ? 'contact__channel' : 'contact__channel contact__channel--disabled'}
                    onClick={(event) => {
                      if (!c.href) event.preventDefault()
                    }}
                  >
                    <c.icon size={18} className="contact__channel-icon" />
                    <div>
                      <div className="contact__channel-label mono">{c.label}</div>
                      <div className="contact__channel-value">{c.value}</div>
                    </div>
                  </a>
                </Magnet>
              ))}
            </div>
          </div>
        </AnimatedContent>

        <AnimatedContent direction="left" distance={30} duration={0.5} delay={0.1}>
          <form className="contact__form" onSubmit={onSubmit}>
            <div className="contact__field">
              <label htmlFor="name">姓名 *</label>
              <input
                id="name"
                type="text"
                required
                maxLength={50}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="你的称呼"
                disabled={status === 'loading'}
              />
            </div>
            <div className="contact__field">
              <label htmlFor="email">邮箱（可选）</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="方便我回复你"
                disabled={status === 'loading'}
              />
            </div>
            <div className="contact__field">
              <label htmlFor="content">留言 *</label>
              <textarea
                id="content"
                required
                minLength={1}
                maxLength={1000}
                rows={4}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="想聊点什么…"
                disabled={status === 'loading'}
              />
            </div>

            <ClickSpark color="#22d3ee" count={8}>
              <button
                type="submit"
                className="contact__submit"
                disabled={status === 'loading' || status === 'success'}
              >
                {status === 'loading' && <MessageSquare size={15} />}
                {status === 'success' && <Check size={15} />}
                {status === 'idle' && <Send size={15} />}
                {status === 'error' && <Send size={15} />}
                {status === 'loading'
                  ? '发送中…'
                  : status === 'success'
                    ? '已发送'
                    : '发送留言'}
              </button>
            </ClickSpark>

            {status === 'error' && (
              <p className="contact__error">{errorMsg}</p>
            )}
            {status === 'success' && (
              <p className="contact__success">感谢留言！我会尽快回复你。</p>
            )}
          </form>
        </AnimatedContent>
      </div>
    </Section>
  )
}
