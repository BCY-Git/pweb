import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

/**
 * 根控制器：仅健康检查。
 * 静态文件托管和 SPA fallback 由 main.ts 中的 Express 中间件处理。
 */
@ApiTags('系统')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({ summary: '健康检查' })
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
    }
  }
}
