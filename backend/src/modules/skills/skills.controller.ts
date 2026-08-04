import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { SkillGroupDto } from './skills.dto'
import { SkillsService } from './skills.service'

@ApiTags('技能')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  @ApiOperation({ summary: '获取技能列表（按分类分组）' })
  @ApiOkResponse({ type: [SkillGroupDto] })
  getGrouped() {
    return this.skillsService.getGrouped()
  }
}
