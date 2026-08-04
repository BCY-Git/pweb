import { Controller, Get, Param } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ProjectDto } from './projects.dto'
import { ProjectsService } from './projects.service'

@ApiTags('项目')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: '获取项目列表（重点项目优先）' })
  @ApiOkResponse({ type: [ProjectDto] })
  findAll() {
    return this.projectsService.findAll()
  }

  @Get('featured')
  @ApiOperation({ summary: '获取重点项目' })
  @ApiOkResponse({ type: ProjectDto })
  findFeatured() {
    return this.projectsService.findFeatured()
  }

  @Get('stats')
  @ApiOperation({ summary: '项目统计数据（给前端数据卡片用）' })
  getStats() {
    return this.projectsService.getStats()
  }

  @Get(':slug')
  @ApiOperation({ summary: '按 slug 获取项目详情' })
  @ApiOkResponse({ type: ProjectDto })
  findBySlug(@Param('slug') slug: string) {
    return this.projectsService.findBySlug(slug)
  }
}
