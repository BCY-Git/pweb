import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BookOpenText,
  Bot,
  ClipboardCheck,
  GitBranch,
  ListChecks,
  MessagesSquare,
  RefreshCw,
  ScanSearch,
  ShieldCheck,
  Waypoints,
  type LucideIcon,
} from 'lucide-react'
import { Section } from '../components/Section'
import './Workflow.css'

interface Stage {
  icon: LucideIcon
  /** 节点短标签（轨道上用，尽量 2~6 字符） */
  key: string
  title: string
  summary: string
  points: string[]
  /** 高亮徽标，如「AC 前置」 */
  tag?: string
}

const STAGES: Stage[] = [
  {
    icon: MessagesSquare,
    key: 'Spec',
    title: 'Spec 阶段',
    summary: '把需求想清楚',
    points: [
      '需求分析 Skill 多轮讨论：澄清边界、穷举场景',
      '产出 Spec 文档——目标 + 范围（明确不做什么）',
      'AC 验收标准前置，作为全流程的完成定义',
    ],
    tag: 'AC 前置',
  },
  {
    icon: ListChecks,
    key: 'Plan',
    title: 'Plan 阶段',
    summary: '把任务拆明白',
    points: [
      '将 Spec 拆解为 AI 可执行的步骤序列',
      '每步标注风险点与验证方式（这步怎么算过）',
      '标注步骤间的依赖关系与可并行项',
    ],
  },
  {
    icon: Bot,
    key: '执行',
    title: '多 Agent 执行',
    summary: '按步骤分配 Agent',
    points: [
      '不同步骤由不同 Agent 执行，必要时多 Agent 并行',
      'worktree 隔离并行任务，互不干扰',
      'checkpoint 提交，任何一步失控都可回退',
    ],
    tag: 'worktree 隔离',
  },
  {
    icon: ShieldCheck,
    key: '门禁',
    title: '自动化门禁',
    summary: '机器能抓的不占用人力',
    points: [
      'lint / typecheck / 单测 / CI 全绿才进入人工环节',
      '机器先行，人和 AI 的注意力留给真正需要判断的问题',
    ],
  },
  {
    icon: ClipboardCheck,
    key: '验收',
    title: '测试验收',
    summary: '对照 AC 逐条验证',
    points: [
      'E2E 测试对照 Spec 中的 AC 逐条验证',
      '测试环节与测试点在 Plan 阶段就已规划',
      'AC 全部通过，功能才算完成',
    ],
    tag: 'AC 贯穿',
  },
  {
    icon: ScanSearch,
    key: 'Review',
    title: '双层 Review',
    summary: '功能 + 整洁度',
    points: [
      '功能 Review：实现符合 Spec/AC，边界情况有覆盖',
      '整洁度 Review：拒绝无谓的兜底策略，风格遵循项目规范',
    ],
  },
  {
    icon: BookOpenText,
    key: '文档',
    title: '文档对齐',
    summary: '代码与文档同步',
    points: [
      '功能变更同步到 README / 接口文档 / CLAUDE.md',
      '「文档已跟进」是合并前的必查项',
    ],
  },
  {
    icon: GitBranch,
    key: 'Git',
    title: 'Git 管理',
    summary: '可追溯交付',
    points: [
      '规范的 commit 粒度与信息、清晰的分支策略',
      'PR 描述由 AI 生成、人工确认，每次交付可追溯',
    ],
  },
  {
    icon: RefreshCw,
    key: '回流',
    title: '经验回流',
    summary: '工作流自我进化',
    points: [
      'Review 发现的重复性问题沉淀为 Skill / Memory',
      '下次同类任务直接复用——反哺 Spec / Plan / 执行',
      '流程越用越强，工具箱随每个项目生长',
    ],
    tag: '反哺全流程',
  },
]

const TOOLBOX = {
  daily: {
    label: '日常驱动',
    items: ['Claude Code', 'Codex', 'Cursor'],
  },
  research: {
    label: '研究兴趣',
    items: ['PIAgent', 'DeepSeek Harness'],
    note: '持续关注智能体架构（Agent Harness）的设计与演进',
  },
}

/**
 * AI 工作流板块：横向 Pipeline 展示从需求到交付的九个环节，
 * 点击节点在下方展开该环节的要点；末端「经验回流」呼应闭环。
 */
export function Workflow() {
  const [active, setActive] = useState(0)
  const stage = STAGES[active]

  return (
    <Section id="workflow" title="AI 工作流" subtitle="ai workflow" tone="stone">
      <motion.div
        className="workflow"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
      >
        <div className="workflow__eyebrow">
          <Waypoints size={16} aria-hidden="true" />
          <span>从需求到交付 · 可追溯、可进化的 AI 协作链路</span>
        </div>

        <div className="workflow__track" role="tablist" aria-label="AI 工作流环节">
          {STAGES.map((s, i) => (
            <button
              key={s.key}
              type="button"
              role="tab"
              aria-selected={i === active}
              className={`workflow__node ${i === active ? 'is-active' : ''}`}
              onClick={() => setActive(i)}
            >
              <span className="workflow__node-circle">
                <s.icon size={18} aria-hidden="true" />
                <span className="workflow__node-index" aria-hidden="true">
                  {i + 1}
                </span>
              </span>
              <span className="workflow__node-label">{s.key}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            className="workflow__panel"
            role="tabpanel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            <div className="workflow__panel-head">
              <span className="workflow__panel-no mono">
                {String(active + 1).padStart(2, '0')}
              </span>
              <h3>{stage.title}</h3>
              <span className="workflow__panel-summary">{stage.summary}</span>
              {stage.tag && <span className="workflow__panel-tag">{stage.tag}</span>}
            </div>
            <ul className="workflow__panel-points">
              {stage.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>

        <div className="workflow__loop">
          <RefreshCw size={14} aria-hidden="true" />
          <span>经验回流反哺 Spec / Plan / 执行 —— 工作流随项目持续进化</span>
        </div>

        <div className="workflow__toolbox">
          <div className="workflow__toolbox-group">
            <span className="workflow__toolbox-label mono">{TOOLBOX.daily.label}</span>
            <div className="workflow__toolbox-items">
              {TOOLBOX.daily.items.map((tool) => (
                <span key={tool} className="workflow__tool">{tool}</span>
              ))}
            </div>
          </div>
          <div className="workflow__toolbox-group">
            <span className="workflow__toolbox-label mono">{TOOLBOX.research.label}</span>
            <div className="workflow__toolbox-items">
              {TOOLBOX.research.items.map((tool) => (
                <span key={tool} className="workflow__tool workflow__tool--research">
                  {tool}
                </span>
              ))}
              <span className="workflow__toolbox-note">{TOOLBOX.research.note}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Section>
  )
}
