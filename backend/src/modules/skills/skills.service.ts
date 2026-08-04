import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { SkillGroupDto, SkillItemDto } from './skills.dto'

/** 分类 key → 中文标签 */
const CATEGORY_LABELS: Record<string, string> = {
  frontend: '前端',
  backend: '后端',
  database: '数据库',
  devops: '工程化',
  ai: 'AI',
}

/** 分类展示顺序 */
const CATEGORY_ORDER = ['frontend', 'backend', 'database', 'devops', 'ai']

/**
 * 技能服务。
 *
 * 返回按分类分组的技能列表，分类按固定顺序排列。
 */
@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) {}

  async getGrouped(): Promise<SkillGroupDto[]> {
    const skills = await this.prisma.skill.findMany({
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    })

    const grouped = new Map<string, SkillItemDto[]>()
    for (const s of skills) {
      const list = grouped.get(s.category) ?? []
      list.push({ name: s.name, level: s.level })
      grouped.set(s.category, list)
    }

    // 按 CATEGORY_ORDER 排序分类，未在表内的分类追加到末尾
    const known = CATEGORY_ORDER.filter((c) => grouped.has(c))
    const extra = [...grouped.keys()].filter((c) => !CATEGORY_ORDER.includes(c))
    return [...known, ...extra]
      .filter((c) => grouped.has(c))
      .map((category) => ({
        category,
        label: CATEGORY_LABELS[category] ?? category,
        items: grouped.get(category) ?? [],
      }))
  }
}
