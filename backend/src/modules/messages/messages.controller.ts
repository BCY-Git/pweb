import { Body, Controller, Post } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { CreateMessageDto } from './messages.dto'
import { MessagesService } from './messages.service'

@ApiTags('留言')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  /**
   * 提交留言。
   * 单 IP 每分钟限 5 次，防刷。
   */
  @Post()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @ApiOperation({ summary: '提交留言（每分钟限 5 次）' })
  create(@Body() dto: CreateMessageDto) {
    return this.messagesService.create(dto)
  }
}
