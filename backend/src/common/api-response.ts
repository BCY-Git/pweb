/**
 * 全局统一响应格式。
 *
 * 所有成功响应由 TransformInterceptor 包装为 { code, message, data }；
 * 错误响应由 AllExceptionsFilter 包装为 { code, message, error? }。
 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data?: T
}
