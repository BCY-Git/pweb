// 统一的 API 封装。
// Vue 里你可能用 axios 实例 + 拦截器；React 这层就是一个普通函数，没有"插件"概念。
// 所有响应都约定为 { data: ... } 或 { error: "..." }。
//
// 路径前缀用 BASE_URL：本地 dev 是 '/'，生产部署在网站 /app 子路径下是 '/app/'，
// 写死 '/api' 会让浏览器把请求打到网站主站去 —— 这个坑只在部署后暴露。
const BASE = import.meta.env.BASE_URL

export async function api<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error || `请求失败 ${res.status}`)
  return body.data as T
}

// 语义化快捷方式：api('/todos') / apiPost('/todos', {title}) / ...
export const apiGet = <T>(path: string) => api<T>(path)

export const apiPost = <T>(path: string, body: unknown) =>
  api<T>(path, { method: 'POST', body: JSON.stringify(body) })

export const apiPut = <T>(path: string, body: unknown) =>
  api<T>(path, { method: 'PUT', body: JSON.stringify(body) })

export const apiDelete = (path: string) => api(path, { method: 'DELETE' })
