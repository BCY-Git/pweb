import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator'

/**
 * 提交留言入参 DTO。
 * 由全局 ValidationPipe 自动校验。
 */
export class CreateMessageDto {
  @ApiProperty({ example: '张三', minLength: 1, maxLength: 50 })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name!: string

  @ApiPropertyOptional({ example: 'zs@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiProperty({ example: '你好，对这个项目很感兴趣！', minLength: 1, maxLength: 1000 })
  @IsString()
  @Length(1, 1000)
  content!: string
}
