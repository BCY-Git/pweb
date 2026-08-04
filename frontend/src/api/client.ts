import type { ApiResponse } from '../types'

/**
 * 统一 fetch 封装。
 *
 * - baseURL 由 Vite proxy 处理，这里用相对路径 /api
 * - 自动解包 ApiResponse，返回 data
 * - 非 2xx 抛出 Error，调用方用 try/catch 处理
 */
export async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`/api/v1${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  // 尝试解析为统一响应结构
  const payload = (await res.json()) as ApiResponse<T>

  if (!res.ok || payload.code !== 0) {
    throw new Error(payload.message || `请求失败 (${res.status})`)
  }

  return payload.data
}
