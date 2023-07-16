import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import {
  ApiConsumes,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import { JwtAuthGuard } from '../auth/guards'

import { CardsService } from './cards.service'
import { UpdateCardDto } from './dto'
import { Card } from './entities/cards.entity'
import { DeleteCardByIdCommand, GetDeckByIdCommand, UpdateCardCommand } from './use-cases'

@ApiTags('Cards')
@Controller('cards')
export class CardsController {
  constructor(private readonly decksService: CardsService, private commandBus: CommandBus) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get card by id', description: 'Get card by id' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Card not found' })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Card> {
    return this.commandBus.execute(new GetDeckByIdCommand(id))
  }

  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Get card by id', description: 'Get card by id' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Card not found' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'questionImg', maxCount: 1 },
      { name: 'answerImg', maxCount: 1 },
    ])
  )
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req,
    @UploadedFiles()
    files: { questionImg: Express.Multer.File[]; answerImg: Express.Multer.File[] },
    @Body() body: UpdateCardDto
  ): Promise<Card> {
    return this.commandBus.execute(
      new UpdateCardCommand(id, body, req.user.id, files.answerImg?.[0], files.questionImg?.[0])
    )
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete card by id', description: 'Delete card by id' })
  @ApiNoContentResponse({ description: 'New tokens generated successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Card not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Req() req): Promise<void> {
    return this.commandBus.execute(new DeleteCardByIdCommand(id, req.user.id))
  }
}
