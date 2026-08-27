import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { Request, Response } from 'express'
import { existsSync, readFileSync } from 'node:fs'

/**
 * 全局异常过滤器。
 *
 * 统一把所有异常转成 ApiResponse 错误结构：
 * { code, message, error? }
 *
 * 特殊处理：
 * - Prisma 已知错误（P2002 唯一约束冲突等）映射为对应 HTTP 状态
 * - HttpException 按 HTTP 状态码返回
 * - 其他未知错误统一 500，日志记录堆栈
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  /**
   * @param spaIndexFile SPA 的 index.html 绝对路径（可选）。
   *   传入后，未匹配路由的 GET 请求（404）会回退到 index.html，
   *   由前端路由接管（/notes/:slug 等页面路由）。
   */
  constructor(private readonly spaIndexFile = '') {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = '服务器内部错误'
    let code = -1

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const res = exception.getResponse()
      message =
        typeof res === 'string'
          ? res
          : ((res as { message?: string | string[] }).message as string) ??
            exception.message
      if (Array.isArray(message)) message = message.join('; ')
      code = status
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const mapped = this.mapPrismaError(exception)
      status = mapped.status
      message = mapped.message
      code = mapped.status
    } else if (exception instanceof Error) {
      message = exception.message
      this.logger.error(
        `未处理异常 ${request.method} ${request.url}: ${exception.message}`,
        exception.stack,
      )
    }

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} → ${status} ${message}`,
      )
    }

    // SPA fallback：未匹配路由的 GET 页面请求回退到 index.html
    if (
      status === 404 &&
      this.spaIndexFile &&
      request.method === 'GET' &&
      !request.path.startsWith('/api/') &&
      existsSync(this.spaIndexFile)
    ) {
      response.type('html').send(readFileSync(this.spaIndexFile, 'utf-8'))
      return
    }

    response.status(status).json({ code, message })
  }

  private mapPrismaError(
    error: Prisma.PrismaClientKnownRequestError,
  ): { status: number; message: string } {
    switch (error.code) {
      case 'P2002':
        return { status: HttpStatus.CONFLICT, message: '数据已存在（唯一约束冲突）' }
      case 'P2025':
        return { status: HttpStatus.NOT_FOUND, message: '记录不存在' }
      default:
        return {
          status: HttpStatus.BAD_REQUEST,
          message: `数据库错误: ${error.code}`,
        }
    }
  }
}
