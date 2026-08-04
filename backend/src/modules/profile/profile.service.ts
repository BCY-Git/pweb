import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { ProfileDto } from './profile.dto'

/**
 * 个人信息服务。
 *
 * 简历站只有一份 Profile（id=1），对外提供只读查询。
 */
@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(): Promise<ProfileDto> {
    const profile = await this.prisma.profile.findUnique({ where: { id: 1 } })
    if (!profile) {
      throw new NotFoundException('个人信息未配置')
    }
    return {
      name: profile.name,
      title: profile.title,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      githubUrl: profile.githubUrl,
      giteeUrl: profile.giteeUrl,
      email: profile.email,
      wechatQrUrl: profile.wechatQrUrl,
      resumeUrl: profile.resumeUrl,
      location: profile.location,
    }
  }
}
