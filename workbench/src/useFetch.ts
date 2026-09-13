import { useCallback, useEffect, useRef, useState } from 'react'
import { apiGet } from './api'

// 自定义 Hook：GET 请求的数据获取 + 加载态 + 错误态 + 手动刷新。
// 对应 Vue 里你会自己写的 useFetch composable（ref + onMounted + watch），
// 差别：React 的 Hook 每次渲染都会重新执行，所以副作用必须放进 useEffect。
export function useFetch<T>(path: string) {
  // Vue: const data = ref<T|null>(null)  →  React: useState 元组 [值, 设值函数]
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // 用 ref 记录"最新一次请求的编号"，防止乱序响应覆盖新数据（竞态）
  const seqRef = useRef(0)

  // useCallback 把函数变成"同一个引用"，除非依赖变化。
  // Vue 里没有这个问题，普通函数就行；React 里传给别处的函数每次渲染都是新的。
  const reload = useCallback(async () => {
    const seq = ++seqRef.current
    setLoading(true)
    setError(null)
    try {
      const result = await apiGet<T>(path)
      if (seq === seqRef.current) setData(result) // 只有最新一次请求才写入
    } catch (e) {
      if (seq === seqRef.current) setError(e instanceof Error ? e.message : String(e))
    } finally {
      if (seq === seqRef.current) setLoading(false)
    }
  }, [path])

  // Vue: onMounted(() => load()) + watch(() => route, load)
  // React: useEffect 统一搞定——依赖数组里的 path 变了就重新跑一遍
  useEffect(() => {
    void reload()
  }, [reload])

  return { data, loading, error, reload }
}
