import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/**
 * 项目响应 DTO。
 *
 * techStack 和 highlights 在数据库里存为 JSON 字符串（SQLite 限制），
 * 对外响应时反序列化为数组，前端直接用。
 */
export class ProjectDto {
  @ApiProperty()
  id!: number

  @ApiProperty({ example: 'mindtree' })
  slug!: string

  @ApiProperty({ example: 'MindTree' })
  name!: string

  @ApiProperty()
  tagline!: string

  @ApiProperty()
  description!: string

  @ApiPropertyOptional()
  coverUrl?: string | null

  @ApiPropertyOptional()
  demoUrl?: string | null

  @ApiPropertyOptional()
  repoUrl?: string | null

  @ApiProperty({ type: [String], example: ['React', 'TypeScript'] })
  techStack!: string[]

  @ApiPropertyOptional({ type: [String] })
  highlights?: string[]

  @ApiProperty()
  isFeatured!: boolean

  @ApiProperty()
  sortOrder!: number
}
