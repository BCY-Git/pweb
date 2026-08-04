import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateMessageDto } from './messages.dto'

/**
 * 留言服务。
 *
 * 仅对外提供创建接口（公开），后台管理读取/标记已读后续扩展。
 */
@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMessageDto) {
    const message = await this.prisma.message.create({
      data: {
        name: dto.name,
        email: dto.email ?? null,
        content: dto.content,
      },
      select: { id: true, createdAt: true },
    })
    return message
  }
}
