import { Injectable, Logger } from '@nestjs/common'
import * as vm from 'node:vm'

/** 主页统计区抓到的原始数据 */
export interface CsdnHomeStats {
  totalViews: number
  originalCount: number
  fansCount: number
  followingCount: number
}

/** 文章列表接口返回的单篇文章（已规范化） */
export interface CsdnArticleRaw {
  articleId: string
  title: string
  url: string
  description: string
  postTime: Date
  viewCount: number
  diggCount: number
  commentCount: number
  isTop: boolean
}

const BASE_URL = 'https://blog.csdn.net'
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

/** 每页大小（接口上限约 40~100，取 40 稳妥） */
const PAGE_SIZE = 40
/** 翻页间隔，避免触发风控 */
const PAGE_DELAY_MS = 500
/** 翻页硬上限，防御性保护 */
const MAX_PAGES = 20

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * CSDN 公开数据爬虫。
 *
 * 只抓取无需登录的公开数据：
 * - 主页 HTML：总访问量 / 原创数 / 粉丝数 / 关注数
 * - 社区文章列表 JSON 接口：文章标题、发布时间、阅读/点赞/评论数
 *
 * CSDN 对部分请求返回 521 + JS 挑战页（网宿 WAF 的 https_ydclearance
 * cookie 验证）。本爬虫在 Node vm 沙箱中执行挑战 JS 解出 cookie 后重试，
 * 全程不解析登录态、不携带用户凭证。
 */
@Injectable()
export class CsdnCrawler {
  private readonly logger = new Logger(CsdnCrawler.name)
  /** 挑战通过后缓存的通行 cookie（进程内复用） */
  private clearanceCookie = ''

  /** 带 WAF 挑战处理的 fetch：521 时解挑战、带 cookie 重试一次 */
  private async fetchText(url: string, referer?: string): Promise<string> {
    const doFetch = () =>
      fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          ...(referer ? { Referer: referer } : {}),
          ...(this.clearanceCookie
            ? { Cookie: this.clearanceCookie }
            : {}),
        },
      })

    let res = await doFetch()
    if (res.status === 521) {
      this.logger.log('命中 WAF 挑战，尝试求解…')
      const challengeHtml = await res.text()
      this.clearanceCookie = this.solveChallenge(challengeHtml)
      res = await doFetch()
    }
    if (!res.ok) {
      throw new Error(`请求失败: HTTP ${res.status} (${url})`)
    }
    return res.text()
  }

  /**
   * 在 vm 沙箱中执行 WAF 挑战 JS，捕获其设置的 cookie。
   *
   * 挑战页结构：自解密脚本 → eval 出真实代码 → document.cookie = 通行值。
   * 沙箱提供最小 window/document/location 桩，仅捕获 cookie，无副作用。
   */
  private solveChallenge(html: string): string {
    const script = html.match(/<script[^>]*>([\s\S]*?)<\/script>/)?.[1]
    if (!script) throw new Error('WAF 挑战页解析失败：未找到脚本')

    let cookie = ''
    const sandbox: Record<string, unknown> = {}
    sandbox.window = sandbox
    const ctx = vm.createContext(sandbox)
    sandbox.setTimeout = (fn: unknown) => {
      if (typeof fn === 'string') vm.runInContext(fn, ctx)
    }
    const documentStub = {}
    Object.defineProperty(documentStub, 'cookie', {
      set: (v: string) => {
        cookie = v
      },
      get: () => cookie,
    })
    sandbox.document = documentStub
    sandbox.location = { reload() {}, href: '', replace() {} }

    vm.runInContext(script, ctx)

    const pair = cookie.split(';')[0]
    if (!pair || !pair.includes('=')) {
      throw new Error('WAF 挑战求解失败：未捕获到 cookie')
    }
    this.logger.log(`挑战求解成功: ${pair.split('=')[0]}`)
    return pair
  }

  /** 抓取主页统计区 */
  async fetchHomeStats(username: string): Promise<CsdnHomeStats> {
    const html = await this.fetchText(`${BASE_URL}/${username}`)

    // 统计区结构：<div class="user-profile-statistics-num">27,097</div>
    //              <div class="user-profile-statistics-name">总访问量</div>
    const pairRe =
      /user-profile-statistics-num[^>]*>\s*([\d,]+)\s*<\/div>\s*<div class="user-profile-statistics-name"[^>]*>\s*([^<]+?)\s*<\/div>/g
    const stats: Record<string, number> = {}
    for (const m of html.matchAll(pairRe)) {
      const value = m[1]
      const name = m[2]
      if (value && name) stats[name] = Number(value.replace(/,/g, ''))
    }

    if (stats['总访问量'] === undefined) {
      throw new Error('CSDN 主页统计区解析失败（页面结构可能已变更）')
    }
    return {
      totalViews: stats['总访问量'] ?? 0,
      originalCount: stats['原创'] ?? 0,
      fansCount: stats['粉丝'] ?? 0,
      followingCount: stats['关注'] ?? 0,
    }
  }

  /** 分页抓取全部文章（按发布时间倒序返回） */
  async fetchAllArticles(username: string): Promise<CsdnArticleRaw[]> {
    const articles: CsdnArticleRaw[] = []

    for (let page = 1; page <= MAX_PAGES; page++) {
      const url =
        `${BASE_URL}/community/home-api/v1/get-business-list` +
        `?page=${page}&size=${PAGE_SIZE}&businessType=blog&orderby=&noFooter=false&username=${username}`
      // 该接口校验 Referer，缺失会返回空响应
      const text = await this.fetchText(url, `${BASE_URL}/${username}`)
      const payload = JSON.parse(text) as {
        code: number
        data?: { total?: number; list?: Record<string, unknown>[] }
      }
      const list = payload.data?.list ?? []
      if (list.length === 0) break

      for (const item of list) {
        articles.push({
          articleId: String(item.articleId),
          title: String(item.title ?? ''),
          url: String(item.url ?? ''),
          description: String(item.description ?? ''),
          // CSDN 返回 "2026-05-21 23:32:02"，转 ISO 兼容格式
          postTime: new Date(String(item.postTime ?? '').replace(' ', 'T')),
          viewCount: Number(item.viewCount ?? 0),
          diggCount: Number(item.diggCount ?? 0),
          commentCount: Number(item.commentCount ?? 0),
          isTop: Boolean(item.top),
        })
      }

      const total = payload.data?.total ?? 0
      if (list.length < PAGE_SIZE || articles.length >= total) break
      await sleep(PAGE_DELAY_MS)
    }

    this.logger.log(`抓取到 ${articles.length} 篇文章`)
    return articles
  }
}
