import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { ProfileDto } from './profile.dto'
import { ProfileService } from './profile.service'

@ApiTags('个人信息')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: '获取个人信息' })
  @ApiOkResponse({ type: ProfileDto })
  getProfile() {
    return this.profileService.getProfile()
  }
}
