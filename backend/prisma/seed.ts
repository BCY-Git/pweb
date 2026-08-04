/**
 * 种子数据。
 *
 * 执行：npm run db:seed
 *
 * 内容：
 * - Profile：占位个人信息（后续替换为真实信息）
 * - Projects：XmindTreeCodex（重点，基于真实调研填写）+ 两个参与项目精选占位
 * - Skills：前端 / 后端 / 数据库 / 工程化 / AI 五类
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const techStackToJson = (arr: string[]) => JSON.stringify(arr)
const highlightsToJson = (arr: string[]) => JSON.stringify(arr)

async function main() {
  // ─── Profile ───
  await prisma.profile.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Martin',
      title: 'AI Agent 全栈开发工程师',
      bio: [
        '## 关于我',
        '',
        '我是一名专注于 **AI Agent 全栈开发** 的工程师，热爱把想法落地成产品。',
        '擅长 React 前端工程化与 NestJS 后端架构，对 LLM 应用集成、Agent 设计有实战经验。',
        '',
        '我相信好的软件来自清晰的分层与持续的小步迭代——这也是我在个人项目 MindTree 里坚持的原则。',
        '',
        '## 我能做什么',
        '',
        '- 前端：React 18/19 · TypeScript · Vite · 状态管理 · 动效',
        '- 后端：NestJS · Prisma · REST API · 鉴权 · 工程化',
        '- AI：LLM 集成 · MCP 协议 · Agent 工作流设计',
        '- 工程化：Docker · CI/CD · 测试 · 代码规范',
      ].join('\n'),
      avatarUrl: null,
      githubUrl: 'https://github.com/', // TODO: 替换为真实 GitHub
      giteeUrl: 'https://gitee.com/', // TODO: 替换为真实 Gitee
      email: 'martin@example.com', // TODO: 替换为真实邮箱
      wechatQrUrl: null, // TODO: 替换为微信二维码
      resumeUrl: null, // TODO: 替换为简历 PDF 链接
      location: '中国',
    },
  })

  // ─── Projects ───
  // 重点项目：MindTree（XmindTreeCodex）—— 基于真实调研
  await prisma.project.upsert({
    where: { slug: 'mindtree' },
    update: {},
    create: {
      slug: 'mindtree',
      name: 'MindTree',
      tagline:
        '本地优先的个人树形工作空间——从零散记录到结构化沉淀的 AI 思维导图工具',
      description: [
        '## 项目简介',
        '',
        'MindTree **不是 XMind 的复刻**，也不是附带思维导图的 AI 聊天软件。',
        '它是一个本地优先的个人树形工作空间，服务四类连续行为：低成本记录、逐步形成结构、智能识别价值、确认后回流为项目状态与知识资产。',
        '',
        '## 核心理念',
        '',
        '> 不要求用户先成为更会记录的人，而是让系统把已有记录转化为更可持续的行动与知识资产。',
        '',
        '## 两个 AI 智能能力',
        '',
        '- **智能沉淀**：从自然记录中识别已完成成果、待办、未解决问题、决策、可复用知识',
        '- **智能协作**：围绕明确任务进行探索→决策→执行→验收→沉淀',
        '',
        '## 架构分层',
        '',
        '```',
        'UI / React Flow adapter',
        '        ↓',
        'Editor state + keyboard router',
        '        ↓',
        'Command executor + history',
        '        ↓',
        'Domain document model ← Layout engine',
        '        ↓',
        'Persistence (IndexedDB)',
        '```',
        '',
        'UI 不直接修改文档，所有变更走 Command executor，保证可撤销与一致性。',
      ].join('\n'),
      coverUrl: null, // TODO: 替换为真实截图
      demoUrl: null, // TODO: 如有在线 Demo 填写
      repoUrl: 'https://github.com/', // TODO: 替换为真实仓库
      techStack: techStackToJson([
        'React 19',
        'TypeScript',
        'Vite',
        '@xyflow/react',
        'Zustand',
        'Zod',
        'Dexie (IndexedDB)',
        'Tauri 2',
        'MCP',
        'Vitest',
      ]),
      highlights: highlightsToJson([
        '清晰分层架构：UI → Editor State → Command Executor → Domain → Persistence，所有变更走命令层保证可撤销',
        'AI Agent 双能力：智能沉淀（识别待办/决策/知识）+ 智能协作（任务探索/决策/执行/验收）',
        '持久迭代：从 0.2 到 1.20，20+ 个版本，配套 30+ 篇 agent 设计文档',
        '工程严谨：命令边界校验（根节点不可删、防环移动）、右向递归树布局算法、Vitest 单测',
        '跨端：Web + Tauri 桌面端',
      ]),
      sortOrder: 0,
      isFeatured: true,
    },
  })

  // 参与项目精选占位（后续补充真实信息）
  await prisma.project.upsert({
    where: { slug: 'afsim-xr' },
    update: {},
    create: {
      slug: 'afsim-xr',
      name: 'AFSIM 智能编程助手',
      tagline: '面向 AFSIM 军事仿真场景的智能编程辅助系统',
      description: [
        '## 项目简介',
        '',
        '参与开发的团队项目，针对 AFSIM 军事仿真领域提供智能编程辅助能力。',
        '',
        '> 注：项目详情待补充，此处为占位。',
      ].join('\n'),
      coverUrl: null,
      demoUrl: null,
      repoUrl: null,
      techStack: techStackToJson(['团队项目', 'AFSIM', '智能编程']),
      highlights: highlightsToJson(['团队协作开发', '领域知识工程']),
      sortOrder: 10,
      isFeatured: false,
    },
  })

  await prisma.project.upsert({
    where: { slug: 'unmanned-system' },
    update: {},
    create: {
      slug: 'unmanned-system',
      name: '无人装备控制系统',
      tagline: '无人破障车 / 无人装备的控制与管理系统',
      description: [
        '## 项目简介',
        '',
        '参与开发的团队项目，覆盖无人破障车的控制、考核、通道障碍物统计等业务模块。',
        '',
        '> 注：项目详情待补充，此处为占位。',
      ].join('\n'),
      coverUrl: null,
      demoUrl: null,
      repoUrl: null,
      techStack: techStackToJson(['团队项目', '无人装备', '控制系统']),
      highlights: highlightsToJson(['全栈开发', '业务模块设计']),
      sortOrder: 20,
      isFeatured: false,
    },
  })

  // ─── Skills ───
  const skills = [
    // 前端
    { category: 'frontend', name: 'React', level: 5, sortOrder: 1 },
    { category: 'frontend', name: 'TypeScript', level: 5, sortOrder: 2 },
    { category: 'frontend', name: 'Vite', level: 4, sortOrder: 3 },
    { category: 'frontend', name: 'Zustand', level: 4, sortOrder: 4 },
    { category: 'frontend', name: 'Framer Motion', level: 3, sortOrder: 5 },
    { category: 'frontend', name: 'CSS / 样式工程', level: 4, sortOrder: 6 },
    // 后端
    { category: 'backend', name: 'NestJS', level: 4, sortOrder: 1 },
    { category: 'backend', name: 'Node.js', level: 4, sortOrder: 2 },
    { category: 'backend', name: 'Express', level: 4, sortOrder: 3 },
    { category: 'backend', name: 'REST API', level: 5, sortOrder: 4 },
    // 数据库
    { category: 'database', name: 'PostgreSQL', level: 4, sortOrder: 1 },
    { category: 'database', name: 'SQLite', level: 4, sortOrder: 2 },
    { category: 'database', name: 'Prisma', level: 5, sortOrder: 3 },
    // 工程化
    { category: 'devops', name: 'Docker', level: 4, sortOrder: 1 },
    { category: 'devops', name: 'GitHub Actions', level: 4, sortOrder: 2 },
    { category: 'devops', name: 'ESLint / Prettier', level: 5, sortOrder: 3 },
    { category: 'devops', name: 'Git', level: 5, sortOrder: 4 },
    { category: 'devops', name: 'Nginx', level: 3, sortOrder: 5 },
    // AI
    { category: 'ai', name: 'LLM 应用集成', level: 4, sortOrder: 1 },
    { category: 'ai', name: 'MCP 协议', level: 4, sortOrder: 2 },
    { category: 'ai', name: 'Agent 工作流设计', level: 4, sortOrder: 3 },
    { category: 'ai', name: 'Prompt 工程', level: 4, sortOrder: 4 },
  ]
  for (const s of skills) {
    const existing = await prisma.skill.findFirst({
      where: { category: s.category, name: s.name },
    })
    if (!existing) {
      await prisma.skill.create({ data: s })
    }
  }

  console.log('✓ 种子数据已写入')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
