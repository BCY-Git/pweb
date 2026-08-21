import { ApiProperty } from '@nestjs/swagger'

export class CsdnSnapshotDto {
  @ApiProperty({ example: '2026-08-21' })
  date!: string

  @ApiProperty({ description: '总访问量' })
  totalViews!: number

  @ApiProperty({ description: '原创文章数' })
  originalCount!: number

  @ApiProperty({ description: '粉丝数' })
  fansCount!: number

  @ApiProperty({ description: '关注数' })
  followingCount!: number

  @ApiProperty({ description: '采集到的文章总数' })
  articleCount!: number
}

export class CsdnOverviewDto {
  @ApiProperty({ description: 'CSDN 用户名' })
  username!: string

  @ApiProperty({ description: '博客主页地址' })
  blogUrl!: string

  @ApiProperty({ type: CsdnSnapshotDto, description: '最新一次统计快照' })
  latest!: CsdnSnapshotDto

  @ApiProperty({
    type: CsdnSnapshotDto,
    nullable: true,
    description: '上一次的快照（用于计算增量，首次采集时为 null）',
  })
  previous!: CsdnSnapshotDto | null

  @ApiProperty({ description: '最近一次同步时间（ISO）' })
  syncedAt!: string
}

export class CsdnArticleDto {
  @ApiProperty()
  articleId!: string

  @ApiProperty()
  title!: string

  @ApiProperty()
  url!: string

  @ApiProperty()
  description!: string

  @ApiProperty({ description: '发布时间（ISO）' })
  postTime!: string

  @ApiProperty({ description: '阅读量' })
  viewCount!: number

  @ApiProperty({ description: '点赞数' })
  diggCount!: number

  @ApiProperty({ description: '评论数' })
  commentCount!: number

  @ApiProperty({ description: '是否置顶' })
  isTop!: boolean
}

export class CsdnSyncResultDto {
  @ApiProperty({ description: '同步的文章数' })
  articleCount!: number

  @ApiProperty({ description: '快照日期' })
  snapshotDate!: string
}
