import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import type { Request, Response } from 'express'
import { LoginDto } from './auth.dto'
import { AuthService, SITE_COOKIE, WORKBENCH_COOKIE } from './auth.service'

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 管理员登录。
   * 成功时同时种下两枚 cookie：site_session（网站登录态）和
   * wb_session（工作台会话，同密钥同格式）—— 登录一次，/app 免密直通。
   */
  @Post('login')
  @ApiOperation({ summary: '管理员登录' })
  login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): { role: 'admin' } | { message: string } {
    if (!this.authService.verifyAdmin(dto.username, dto.password)) {
      res.status(401)
      return { message: '账号或密码不对' }
    }
    res.setHeader('Set-Cookie', [
      this.authService.makeCookie(SITE_COOKIE),
      this.authService.makeCookie(WORKBENCH_COOKIE),
    ])
    return { role: 'admin' }
  }

  /** 探测登录态：前端据此决定导航里是否显示「工作台」入口。 */
  @Get('me')
  @ApiOperation({ summary: '探测登录态' })
  me(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    if (!this.authService.sessionValid(req.headers.cookie, SITE_COOKIE)) {
      res.status(401)
      return { message: '未登录' }
    }
    return { role: 'admin' as const }
  }

  @Post('logout')
  @ApiOperation({ summary: '退出登录' })
  logout(@Res({ passthrough: true }) res: Response): { role: null } {
    res.setHeader('Set-Cookie', [
      this.authService.clearCookie(SITE_COOKIE),
      this.authService.clearCookie(WORKBENCH_COOKIE),
    ])
    return { role: null }
  }
}
