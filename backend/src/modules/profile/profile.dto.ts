import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/**
 * 个人信息响应 DTO。
 */
export class ProfileDto {
  @ApiProperty()
  name!: string

  @ApiProperty()
  title!: string

  @ApiProperty()
  bio!: string

  @ApiPropertyOptional()
  avatarUrl?: string | null

  @ApiPropertyOptional()
  githubUrl?: string | null

  @ApiPropertyOptional()
  giteeUrl?: string | null

  @ApiPropertyOptional()
  email?: string | null

  @ApiPropertyOptional()
  phone?: string | null

  @ApiPropertyOptional()
  wechatId?: string | null

  @ApiPropertyOptional()
  blogUrl?: string | null

  @ApiPropertyOptional()
  wechatQrUrl?: string | null

  @ApiPropertyOptional()
  resumeUrl?: string | null

  @ApiPropertyOptional()
  location?: string | null
}
