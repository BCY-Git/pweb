import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron } from '@nestjs/schedule'
import { PrismaService } from '../../prisma/prisma.service'
import { AppConfig } from '../../config/configuration'
import { CsdnCrawler } from './csdn.crawler'
import {
  CsdnArticleDto,
  CsdnOverviewDto,
  CsdnSnapshotDto,
  CsdnSyncResultDto,
} from './csdn.dto'

/** 本地时区的 YYYY-MM-DD */
function localDate(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * CSDN 数据服务。
 *
 * - 每天凌晨自动同步一次公开数据（快照 + 文章列表）
 * - 应用启动时若当天还没有快照则补一次（异步，不阻塞启动）
 * - 提供 overview / trend / articles 查询
 */
@Injectable()
export class CsdnService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CsdnService.name)
  private syncing = false

  constructor(
    private readonly prisma: PrismaService,
    private readonly crawler: CsdnCrawler,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  private get username(): string {
    return this.config.get<string>('csdnUsername') ?? 'm0_64547013'
  }

  onApplicationBootstrap() {
    // 启动补采：当天无快照则后台同步一次，失败只记日志
    void this.prisma.csdnSnapshot
      .findUnique({ where: { date: localDate() } })
      .then((snap) => {
        if (!snap) {
          this.logger.log('当天暂无 CSDN 快照，启动后台同步…')
          return this.syncAll().catch((e: Error) =>
            this.logger.warn(`启动同步失败: ${e.message}`),
          )
        }
        return undefined
      })
      .catch((e: Error) => this.logger.warn(`启动快照检查失败: ${e.message}`))
  }

  /** 每日 03:30 定时同步 */
  @Cron('0 30 3 * * *')
  async scheduledSync() {
    try {
      await this.syncAll()
    } catch (e) {
      this.logger.warn(`定时同步失败: ${(e as Error).message}`)
    }
  }

  /** 全量同步：主页统计 → 当日快照；文章列表 → upsert */
  async syncAll(): Promise<CsdnSyncResultDto> {
    if (this.syncing) {
      throw new Error('同步进行中，请稍后再试')
    }
    this.syncing = true
    try {
      this.logger.log(`开始同步 CSDN 数据（${this.username}）…`)
      const [stats, articles] = await Promise.all([
        this.crawler.fetchHomeStats(this.username),
        this.crawler.fetchAllArticles(this.username),
      ])

      const date = localDate()
      await this.prisma.csdnSnapshot.upsert({
        where: { date },
        update: { ...stats, articleCount: articles.length },
        create: { date, ...stats, articleCount: articles.length },
      })

      for (const a of articles) {
        await this.prisma.csdnArticle.upsert({
          where: { articleId: a.articleId },
          update: {
            title: a.title,
            url: a.url,
            description: a.description,
            postTime: a.postTime,
            viewCount: a.viewCount,
            diggCount: a.diggCount,
            commentCount: a.commentCount,
            isTop: a.isTop,
          },
          create: a,
        })
      }

      this.logger.log(`CSDN 同步完成：${articles.length} 篇文章，快照 ${date}`)
      return { articleCount: articles.length, snapshotDate: date }
    } finally {
      this.syncing = false
    }
  }

  /** 概览：最新快照 + 上一次快照（算增量用） */
  async getOverview(): Promise<CsdnOverviewDto | null> {
    const snapshots = await this.prisma.csdnSnapshot.findMany({
      orderBy: { date: 'desc' },
      take: 2,
    })
    const [latest, previous] = snapshots
    if (!latest) return null

    const toDto = (s: (typeof snapshots)[number]): CsdnSnapshotDto => ({
      date: s.date,
      totalViews: s.totalViews,
      originalCount: s.originalCount,
      fansCount: s.fansCount,
      followingCount: s.followingCount,
      articleCount: s.articleCount,
    })

    return {
      username: this.username,
      blogUrl: `https://blog.csdn.net/${this.username}`,
      latest: toDto(latest),
      previous: previous ? toDto(previous) : null,
      syncedAt: latest.createdAt.toISOString(),
    }
  }

  /** 趋势：最近 N 天的快照（按日期升序） */
  async getTrend(days = 30): Promise<CsdnSnapshotDto[]> {
    const rows = await this.prisma.csdnSnapshot.findMany({
      orderBy: { date: 'desc' },
      take: Math.min(Math.max(days, 1), 365),
    })
    return rows.reverse().map((s) => ({
      date: s.date,
      totalViews: s.totalViews,
      originalCount: s.originalCount,
      fansCount: s.fansCount,
      followingCount: s.followingCount,
      articleCount: s.articleCount,
    }))
  }

  /** 文章列表：按发布时间倒序 */
  async getArticles(): Promise<CsdnArticleDto[]> {
    const rows = await this.prisma.csdnArticle.findMany({
      orderBy: [{ isTop: 'desc' }, { postTime: 'desc' }],
    })
    return rows.map((r) => ({
      articleId: r.articleId,
      title: r.title,
      url: r.url,
      description: r.description,
      postTime: r.postTime.toISOString(),
      viewCount: r.viewCount,
      diggCount: r.diggCount,
      commentCount: r.commentCount,
      isTop: r.isTop,
    }))
  }
}
