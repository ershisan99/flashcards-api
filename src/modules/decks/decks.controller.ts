import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { ApiTags } from '@nestjs/swagger'

import { Pagination } from '../../infrastructure/common/pagination/pagination.service'
import { JwtAuthGuard } from '../auth/guards'
import { CreateCardDto, GetAllCardsInDeckDto } from '../cards/dto'

import { DecksService } from './decks.service'
import { UpdateDeckDto, CreateDeckDto, GetAllDecksDto } from './dto'
import {
  CreateDeckCommand,
  DeleteDeckByIdCommand,
  GetAllCardsInDeckCommand,
  GetAllDecksCommand,
  GetDeckByIdCommand,
  UpdateDeckCommand,
  GetRandomCardInDeckCommand,
  SaveGradeCommand,
  CreateCardCommand,
} from './use-cases'

@ApiTags('Decks')
@Controller('decks')
export class DecksController {
  constructor(private readonly decksService: DecksService, private commandBus: CommandBus) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'cover', maxCount: 1 }]))
  @Post()
  create(
    @Request() req,
    @UploadedFiles()
    files: {
      cover: Express.Multer.File[]
    },
    @Body() createDeckDto: CreateDeckDto
  ) {
    const userId = req.user.id

    return this.commandBus.execute(
      new CreateDeckCommand({ ...createDeckDto, userId: userId }, files?.cover?.[0])
    )
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: GetAllDecksDto, @Req() req) {
    const finalQuery = Pagination.getPaginationData(query)

    return this.commandBus.execute(new GetAllDecksCommand({ ...finalQuery, userId: req.user.id }))
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commandBus.execute(new GetDeckByIdCommand(id))
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/cards')
  findCardsInDeck(@Param('id') id: string, @Req() req, @Query() query: GetAllCardsInDeckDto) {
    const finalQuery = Pagination.getPaginationData(query)

    return this.commandBus.execute(new GetAllCardsInDeckCommand(req.user.id, id, finalQuery))
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/learn')
  findRandomCardInDeck(@Param('id') id: string, @Req() req) {
    return this.commandBus.execute(new GetRandomCardInDeckCommand(req.user.id, id))
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/learn')
  saveGrade(@Param('id') id: string, @Req() req, @Body() body: any) {
    return this.commandBus.execute(
      new SaveGradeCommand(req.user.id, { cardId: body.cardId, grade: body.grade })
    )
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'questionImg', maxCount: 1 },
      { name: 'answerImg', maxCount: 1 },
    ])
  )
  @Post(':id/cards')
  createCardInDeck(
    @Param('id') id: string,
    @Req() req,
    @UploadedFiles()
    files: { questionImg: Express.Multer.File[]; answerImg: Express.Multer.File[] },
    @Body() card: CreateCardDto
  ) {
    return this.commandBus.execute(
      new CreateCardCommand(req.user.id, id, card, files.answerImg?.[0], files.questionImg?.[0])
    )
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'cover', maxCount: 1 }]))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @UploadedFiles()
    files: {
      cover: Express.Multer.File[]
    },
    @Body() updateDeckDto: UpdateDeckDto,
    @Req() req
  ) {
    return this.commandBus.execute(
      new UpdateDeckCommand(id, updateDeckDto, req.user.id, files?.cover?.[0])
    )
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.commandBus.execute(new DeleteDeckByIdCommand(id, req.user.id))
  }
}
