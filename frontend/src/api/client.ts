import type { ApiResponse } from '../types'

/**
 * 统一 fetch 封装。
 *
 * - baseURL 由 Vite proxy 处理，这里用相对路径 /api
 * - 自动解包 ApiResponse，返回 data
 * - 非 2xx 抛出 Error，调用方用 try/catch 处理
 * - 内置 2 次重试（间隔 1 秒），应对后端短暂重启
 */

async function rawRequest<T>(
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

  const payload = (await res.json()) as ApiResponse<T>

  if (!res.ok || payload.code !== 0) {
    throw new Error(payload.message || `请求失败 (${res.status})`)
  }

  return payload.data
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function request<T>(
  path: string,
  init?: RequestInit,
  retries = 2,
): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await rawRequest<T>(path, init)
    } catch (err) {
      lastError = err
      // 非最后一次重试时，等 1 秒再试
      if (attempt < retries) {
        await sleep(1000)
      }
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error('请求失败')
}
