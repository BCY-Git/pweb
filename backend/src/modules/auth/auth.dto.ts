import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength, MinLength } from 'class-validator'

/**
 * 站点管理员登录入参 DTO。
 * 由全局 ValidationPipe 自动校验。
 */
export class LoginDto {
  @ApiProperty({ example: 'admin', minLength: 1, maxLength: 50 })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  username!: string

  @ApiProperty({ example: '******', minLength: 1, maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  password!: string
}
