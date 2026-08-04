import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { map, Observable } from 'rxjs'

/**
 * 全局响应转换拦截器。
 *
 * 把 Controller 返回的裸数据统一包装为：
 * { code: 0, message: 'ok', data: <原始返回> }
 *
 * 这样前端拿到统一结构，无需逐个接口判断。
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, { code: number; message: string; data: T }>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<{ code: number; message: string; data: T }> {
    return next
      .handle()
      .pipe(map((data) => ({ code: 0, message: 'ok', data })))
  }
}
