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
import { DecksService } from './decks.service'
import { CreateDeckDto } from './dto/create-deck.dto'
import { UpdateDeckDto } from './dto/update-deck.dto'
import { CommandBus } from '@nestjs/cqrs'
import {
  CreateDeckCommand,
  DeleteDeckByIdCommand,
  GetAllCardsInDeckCommand,
  GetAllDecksCommand,
  GetDeckByIdCommand,
  UpdateDeckCommand,
  CreateCardCommand,
} from './use-cases'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { GetAllDecksDto } from './dto/get-all-decks.dto'
import { GetAllCardsInDeckDto } from '../cards/dto/get-all-cards.dto'
import { CreateCardDto } from '../cards/dto/create-card.dto'
import { Pagination } from '../../infrastructure/common/pagination/pagination.service'
import { GetRandomCardInDeckCommand } from './use-cases/get-random-card-in-deck-use-case'
import { SaveGradeCommand } from './use-cases/save-grade-use-case'
import { FileFieldsInterceptor } from '@nestjs/platform-express'

@Controller('decks')
export class DecksController {
  constructor(private readonly decksService: DecksService, private commandBus: CommandBus) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() createDeckDto: CreateDeckDto) {
    const userId = req.user.id
    return this.commandBus.execute(new CreateDeckCommand({ ...createDeckDto, userId: userId }))
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
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeckDto: UpdateDeckDto, @Req() req) {
    return this.commandBus.execute(new UpdateDeckCommand(id, updateDeckDto, req.user.id))
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.commandBus.execute(new DeleteDeckByIdCommand(id, req.user.id))
  }
}
