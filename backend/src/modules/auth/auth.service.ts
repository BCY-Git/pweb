import { createHmac, timingSafeEqual } from 'node:crypto'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

/**
 * 单管理员会话：无状态 HMAC 签名 cookie（`<exp>.<sig>`），零存储零依赖。
 *
 * `wb_session` 与个人工作台（/app，独立 Express 进程）共用同一签发格式与密钥：
 * 在网站登录一次，工作台即免密直通 —— 两个服务都只认这一把钥匙。
 * 常量与 cookie 名必须与 workbench/server/index.js 保持一致。
 */
export const SITE_COOKIE = 'site_session'
export const WORKBENCH_COOKIE = 'wb_session'

const TTL_MS = 7 * 24 * 3600 * 1000

@Injectable()
export class AuthService {
  constructor(private readonly config: ConfigService) {}

  private secret(): string {
    return this.config.get<string>('WB_SESSION_SECRET') ?? 'dev-secret'
  }

  private sign(exp: number): string {
    return createHmac('sha256', this.secret()).update(String(exp)).digest('hex')
  }

  makeCookie(name: string): string {
    const exp = Date.now() + TTL_MS
    return `${name}=${exp}.${this.sign(exp)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${TTL_MS / 1000}`
  }

  clearCookie(name: string): string {
    return `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  }

  /** 从请求头解析并校验指定会话 cookie。 */
  sessionValid(cookieHeader: string | undefined, name: string): boolean {
    if (!cookieHeader) return false
    const target = cookieHeader
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${name}=`))
    if (!target) return false

    const raw = target.slice(name.length + 1)
    const dot = raw.indexOf('.')
    if (dot < 0) return false

    const exp = Number(raw.slice(0, dot))
    const sig = raw.slice(dot + 1)
    if (!Number.isFinite(exp) || exp < Date.now()) return false

    const expected = Buffer.from(this.sign(exp))
    const received = Buffer.from(sig)
    if (expected.length !== received.length) return false
    return timingSafeEqual(expected, received)
  }

  /** 校验管理员账号密码（凭据来自 .env，恒定时间比较）。 */
  verifyAdmin(username: string, password: string): boolean {
    const expectedUser =
      this.config.get<string>('SITE_ADMIN_USERNAME') ?? 'admin'
    const expectedPass = this.config.get<string>('SITE_ADMIN_PASSWORD') ?? ''

    const userOk = this.safeEqual(username, expectedUser)
    const passOk = this.safeEqual(password, expectedPass)
    return userOk && passOk
  }

  private safeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a)
    const bufB = Buffer.from(b)
    if (bufA.length !== bufB.length) return false
    return timingSafeEqual(bufA, bufB)
  }
}
