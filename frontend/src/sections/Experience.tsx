import { motion } from 'framer-motion'
import { Award, BriefcaseBusiness, GraduationCap } from 'lucide-react'
import { Section } from '../components/Section'
import './Experience.css'

const WORK_EXPERIENCE = [
  {
    company: 'XXXX 科技有限公司',
    role: 'AI Agent 全栈开发',
    time: '2025.11 — 至今',
    details: [
      '负责 AFSIM 智能编程助手的 Agent Harness、前端架构、技术选型与核心功能开发，参与本机服务、仿真调用和工程验证链路建设。',
      '主导多个项目从立项、技术方案、开发到上线迭代的完整生命周期，承担主要前端开发及部分 Node.js / Java 服务端工作。',
      '负责虚拟战场综合系统后期迭代与维护，覆盖实时通信、战术地图、训练评分和保密环境离线交付。',
    ],
  },
  {
    company: 'XXXX 技术有限公司',
    role: '前端开发',
    time: '2025.08 — 2025.10',
    details: ['参与既有 Vue 企业级项目的功能迭代与维护，熟悉需求协作、代码评审、版本管理和前端工程化流程。'],
  },
]

export function Experience() {
  return (
    <Section id="experience" title="经历" subtitle="experience">
      <div className="experience">
        <motion.article
          className="experience__education"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.45 }}
        >
          <div className="experience__kicker">
            <GraduationCap size={17} /> EDUCATION
          </div>
          <div className="experience__header">
            <div>
              <h3>安徽中医药大学 · 计算机相关专业</h3>
              <p>本科一批 · GPA 3.51 / 5.0 · 党积极分子、社团部长</p>
            </div>
            <time>2021.09 — 2025.06</time>
          </div>
          <div className="experience__awards">
            <Award size={18} aria-hidden="true" />
            <p>
              APMCM 亚太地区大学生数学建模竞赛国家级三等奖；连续两年获得校级优秀奖学金。<br />
              CUMCM 全国大学生数学建模竞赛省级三等奖；第十六届全国大学生数学竞赛校级二等奖。
            </p>
          </div>
        </motion.article>

        <div className="experience__work">
          <div className="experience__kicker">
            <BriefcaseBusiness size={17} /> WORK EXPERIENCE
          </div>
          {WORK_EXPERIENCE.map((item, index) => (
            <motion.article
              className="experience__job"
              key={`${item.company}-${item.time}`}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
            >
              <span className="experience__line" aria-hidden="true" />
              <div className="experience__header">
                <div>
                  <h3>{item.company}</h3>
                  <p>{item.role}</p>
                </div>
                <time>{item.time}</time>
              </div>
              <ul>
                {item.details.map((detail) => <li key={detail}>{detail}</li>)}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </Section>
  )
}
