import { ApiProperty } from '@nestjs/swagger'

export class SkillItemDto {
  @ApiProperty()
  name!: string

  @ApiProperty({ minimum: 1, maximum: 5 })
  level!: number
}

export class SkillGroupDto {
  @ApiProperty({ example: 'frontend' })
  category!: string

  @ApiProperty({
    type: [SkillItemDto],
    description: '中文分类名（前端/后端/数据库/工程化/AI）',
  })
  label!: string

  @ApiProperty({ type: [SkillItemDto] })
  items!: SkillItemDto[]
}
