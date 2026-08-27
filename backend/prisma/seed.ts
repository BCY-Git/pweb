/**
 * 个人网站种子数据。
 *
 * 执行：pnpm --filter @martin-portfolio/api db:seed
 * 该脚本可重复执行，会同步覆盖个人资料、项目与技能，便于部署更新。
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const toJson = (items: string[]) => JSON.stringify(items)

async function main() {
  const profile = {
    name: 'BCY',
    title: 'AI Agent 全栈开发工程师',
    bio: [
      '## 关于我',
      '',
      '专注于将模型调用构建为**可控、可中断、可恢复**的工程链路，具备 Agent Harness、RAG 与全栈系统集成实践。',
      '熟悉 TypeScript、React / Next.js、Vue 3、Node.js / NestJS 与 Java / Spring Boot，可独立完成从前端架构到本机能力集成的端到端交付。',
      '',
      '重视 Schema 校验、路径白名单、密钥保护、乐观版本冲突检测与自动化测试，也有保密环境离线部署和现场交付经验。',
    ].join('\n'),
    avatarUrl: null,
    githubUrl: null,
    giteeUrl: null,
    email: '2097588616@qq.com',
    phone: '17768125982',
    wechatId: 'wrbcy17768125982',
    blogUrl: 'https://blog.csdn.net/m0_64547013?spm=1000.2115.3001.5343',
    wechatQrUrl: null,
    resumeUrl: null,
    location: null,
  }

  await prisma.profile.upsert({
    where: { id: 1 },
    update: profile,
    create: { id: 1, ...profile },
  })

  const projects = [
    {
      slug: 'afsim-agent-platform',
      name: 'AFSIM 智能仿真脚本研发 AI Agent 平台',
      tagline: '面向 AFSIM 脚本研发的本地私有化 AI Agent 平台与 Web IDE',
      description: [
        '## 项目简介',
        '',
        '面向 AFSIM（AFRL 体系多域仿真框架）脚本研发的垂直领域 AI Agent 平台，覆盖自然语言需求理解、脚本生成、工程修改、静态诊断、仿真执行和结构化诊断。',
        '版本由本人独立完成架构设计与开发，验证的产品形态与功能链路被团队采纳为产品方向，并作为核心开发参与公司产品版本落地。',
      ].join('\n'),
      coverUrl: null,
      demoUrl: null,
      repoUrl: null,
      techStack: toJson([
        'TypeScript', 'Next.js', 'NestJS', 'LangGraph.js', 'Qdrant',
        'Ollama', 'Monaco', 'SSE', 'Vitest',
      ]),
      highlights: toJson([
        '基于 LangGraph.js StateGraph 编排意图解析、检索、规划/执行与校验；低置信度或异常时降级关键词规则，并记录回退来源。',
        '用原生 interrupt() 实现计划确认与断点续跑；通过 Postgres 与内存双 Checkpointer 支撑任务会话和多轮对话。',
        '实现向量与关键词混合检索、三级上下文预算及向量库不可用时的纯关键词降级。',
        '文件、终端和仿真程序均收口到服务端受控接口，完成路径穿越防护、超时终止及 ERROR / Warning 结构化诊断。',
        '建立意图、分块、语法校验与跨包类型契约的自动化测试，真实模型和仿真测试使用环境门控。',
      ]),
      sortOrder: 0,
      isFeatured: true,
    },
    {
      slug: 'mindtree',
      name: 'MindTree 本地优先 AI 思维导图',
      tagline: '支持受控 AI 协作与 MCP 接入的本地优先桌面思维导图',
      description: [
        '## 项目简介',
        '',
        '独立设计并开发的本地优先桌面思维导图，服务个人知识整理需求，支持树形编辑、自由主题、关系线、附件、全文检索、跨导图沉淀及 MCP 接入，持续迭代二十余个版本。',
      ].join('\n'),
      coverUrl: null,
      demoUrl: null,
      repoUrl: null,
      techStack: toJson([
        'React 19', 'TypeScript', 'Tauri 2', 'Zustand', 'Dexie',
        'Zod', 'MCP', 'SQLite', 'Vitest',
      ]),
      highlights: toJson([
        '将增删改、移动、拖拽、复制粘贴和 AI 重组收口为三十余种可撤销 Command，并在每次变更后校验树结构一致性。',
        'Agent 输出先经 Zod 与本地白名单校验，候选以差异预览和用户确认后统一走 Command 写入，无法绕过领域规则。',
        'MCP 写入同时通过一次性确认令牌、归属校验、乐观版本检查与 SQLite 原子事务，防止未确认写入和并发覆盖。',
        '基于 React Flow 实现两遍递归子树布局、语义缩放双阈值与分支投影，保持复杂画布交互稳定可读。',
        '完成 Tauri 封装及 Markdown、OPML、SVG 导入导出；三百余项自动化测试通过。',
      ]),
      sortOrder: 10,
      isFeatured: true,
    },
    {
      slug: 'virtual-battlefield',
      name: '虚拟战场综合系统平台',
      tagline: '多域无人装备训练仿真的态势指挥与导调控制平台',
      description: [
        '## 项目简介',
        '',
        '面向多域无人装备训练的虚拟战场仿真平台，Web 端基于 Leaflet 构建二维战术态势与导调控制界面，并与三维仿真引擎实时联动。',
        '本人负责两个 Vue 3 应用的从 0 到 1 搭建与持续迭代，并独立维护、迭代 Java 服务端半年以上。',
      ].join('\n'),
      coverUrl: null,
      demoUrl: null,
      repoUrl: null,
      techStack: toJson([
        'Spring Boot 3.2', 'Netty', 'Vue 3', 'Vite', 'Leaflet',
        'Redis', 'SSE', 'WebSocket', 'MyBatis-Plus', 'MinIO',
      ]),
      highlights: toJson([
        '维护 11 类业务报文的双向通信；在既有字符串编解码约束下实现转义感知的 JSON 报文重组与异常隔离。',
        '前端按 modelId 执行字段级 Diff，仅对发生位移的装备调用 setLatLng，并在标绘拖拽期间暂停刷新以缓解地图卡顿。',
        '实现三级训练任务树、硬约束下的时间片生成，以及基于球面绕数法和 BigDecimal 的区域判定与评分算法。',
        '完成无外网保密环境的离线瓦片、内网代理、任务标绘与现场交付；通过 WebView JS Bridge 驱动三维引擎。',
      ]),
      sortOrder: 20,
      isFeatured: false,
    },
  ]

  for (const project of projects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: project,
      create: project,
    })
  }

  await prisma.project.deleteMany({
    where: { slug: { in: ['afsim-xr', 'unmanned-system'] } },
  })

  const skills = [
    { category: 'frontend', name: 'TypeScript', level: 5, sortOrder: 1 },
    { category: 'frontend', name: 'React / Next.js', level: 5, sortOrder: 2 },
    { category: 'frontend', name: 'Vue 3', level: 5, sortOrder: 3 },
    { category: 'frontend', name: 'Leaflet', level: 4, sortOrder: 4 },
    { category: 'frontend', name: 'Monaco Editor', level: 4, sortOrder: 5 },
    { category: 'backend', name: 'Node.js / NestJS', level: 5, sortOrder: 1 },
    { category: 'backend', name: 'Java / Spring Boot', level: 4, sortOrder: 2 },
    { category: 'backend', name: 'Netty', level: 4, sortOrder: 3 },
    { category: 'backend', name: 'SSE / WebSocket', level: 5, sortOrder: 4 },
    { category: 'database', name: 'PostgreSQL', level: 4, sortOrder: 1 },
    { category: 'database', name: 'SQLite', level: 4, sortOrder: 2 },
    { category: 'database', name: 'Redis', level: 4, sortOrder: 3 },
    { category: 'database', name: 'Qdrant', level: 4, sortOrder: 4 },
    { category: 'devops', name: 'Docker', level: 4, sortOrder: 1 },
    { category: 'devops', name: 'Linux 离线部署', level: 4, sortOrder: 2 },
    { category: 'devops', name: 'Vitest', level: 4, sortOrder: 3 },
    { category: 'devops', name: 'Schema / 类型契约', level: 5, sortOrder: 4 },
    { category: 'ai', name: 'LangGraph.js', level: 5, sortOrder: 1 },
    { category: 'ai', name: 'Agent Harness', level: 5, sortOrder: 2 },
    { category: 'ai', name: 'RAG 混合检索', level: 5, sortOrder: 3 },
    { category: 'ai', name: 'Ollama', level: 4, sortOrder: 4 },
    { category: 'ai', name: 'MCP', level: 5, sortOrder: 5 },
  ]

  await prisma.skill.deleteMany()
  await prisma.skill.createMany({ data: skills })

  console.log('✓ 个人网站数据已同步')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
