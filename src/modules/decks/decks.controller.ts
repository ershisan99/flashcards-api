import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import {
  ApiConsumes,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import { Pagination } from '../../infrastructure/common/pagination/pagination.service'
import { SaveGradeDto } from '../auth/dto'
import { JwtAuthGuard } from '../auth/guards'
import { CreateCardDto, GetAllCardsInDeckDto } from '../cards/dto'
import { Card, PaginatedCards } from '../cards/entities/cards.entity'

import { DecksService } from './decks.service'
import { CreateDeckDto, GetAllDecksDto, UpdateDeckDto } from './dto'
import { GetRandomCardDto } from './dto/get-random-card.dto'
import { Deck, DeckWithAuthor, PaginatedDecks } from './entities/deck.entity'
import {
  CreateCardCommand,
  CreateDeckCommand,
  DeleteDeckByIdCommand,
  GetAllCardsInDeckCommand,
  GetAllDecksCommand,
  GetDeckByIdCommand,
  GetRandomCardInDeckCommand,
  SaveGradeCommand,
  UpdateDeckCommand,
} from './use-cases'

@ApiTags('Decks')
@Controller('decks')
export class DecksController {
  constructor(private readonly decksService: DecksService, private commandBus: CommandBus) {}

  @HttpCode(HttpStatus.PARTIAL_CONTENT)
  @ApiOperation({ description: 'Retrieve paginated decks list.', summary: 'Paginated decks list' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: GetAllDecksDto, @Req() req): Promise<PaginatedDecks> {
    const finalQuery = Pagination.getPaginationData(query)

    return this.commandBus.execute(new GetAllDecksCommand({ ...finalQuery, userId: req.user.id }))
  }

  @ApiConsumes('multipart/form-data')
  @ApiOperation({ description: 'Create a deck', summary: 'Create a deck' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
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
  ): Promise<DeckWithAuthor> {
    const userId = req.user.id

    return this.commandBus.execute(
      new CreateDeckCommand({ ...createDeckDto, userId: userId }, files?.cover?.[0])
    )
  }

  @ApiOperation({ description: 'Retrieve a deck by id', summary: 'Retrieve a deck by id' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<DeckWithAuthor> {
    return this.commandBus.execute(new GetDeckByIdCommand(id))
  }

  @ApiConsumes('multipart/form-data')
  @ApiOperation({ description: 'Update a deck', summary: 'Update a deck' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Deck not found' })
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
  ): Promise<DeckWithAuthor> {
    return this.commandBus.execute(
      new UpdateDeckCommand(id, updateDeckDto, req.user.id, files?.cover?.[0])
    )
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: 'Delete a deck', summary: 'Delete a deck' })
  @ApiOkResponse({ description: 'Deck deleted', type: Deck })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Deck not found' })
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req): Promise<Deck> {
    return this.commandBus.execute(new DeleteDeckByIdCommand(id, req.user.id))
  }

  @ApiOperation({
    description: 'Retrieve paginated cards in a deck',
    summary: 'Retrieve cards in a deck',
  })
  @UseGuards(JwtAuthGuard)
  @Get(':id/cards')
  findCardsInDeck(
    @Param('id') id: string,
    @Req() req,
    @Query() query: GetAllCardsInDeckDto
  ): Promise<PaginatedCards> {
    const finalQuery = Pagination.getPaginationData(query)

    return this.commandBus.execute(new GetAllCardsInDeckCommand(req.user.id, id, finalQuery))
  }

  @ApiConsumes('multipart/form-data')
  @ApiOperation({ description: 'Create card in a deck', summary: 'Create a card' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Deck not found' })
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
    @Body()
    card: CreateCardDto,
    files?: { questionImg: Express.Multer.File[]; answerImg: Express.Multer.File[] }
  ): Promise<Card> {
    return this.commandBus.execute(
      new CreateCardCommand(req.user.id, id, card, files?.answerImg?.[0], files?.questionImg?.[0])
    )
  }

  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Retrieve a random card in a deck. The cards priority is based on the grade',
    summary: 'Retrieve a random card',
  })
  @Get(':id/learn')
  findRandomCardInDeck(
    @Param('id') id: string,
    @Req() req,
    @Query() query: GetRandomCardDto
  ): Promise<Card> {
    return this.commandBus.execute(
      new GetRandomCardInDeckCommand(req.user.id, id, query.previousCardId)
    )
  }

  @UseGuards(JwtAuthGuard)
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Card not found' })
  @HttpCode(HttpStatus.OK)
  @ApiNoContentResponse({ description: 'Grade saved' })
  @Post(':id/learn')
  @ApiOperation({
    description: 'Save the grade of a card',
    summary: 'Save the grade of a card',
  })
  async saveGrade(@Param('id') deckId: string, @Req() req, @Body() body: SaveGradeDto) {
    const saved = await this.commandBus.execute(
      new SaveGradeCommand(req.user.id, { cardId: body.cardId, grade: body.grade })
    )

    return await this.commandBus.execute(
      new GetRandomCardInDeckCommand(req.user.id, saved.deckId, saved.id)
    )
  }
}
