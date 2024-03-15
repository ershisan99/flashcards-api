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
  Version,
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
import { Card, CardWithGrade, PaginatedCardsWithGrade } from '../cards/entities/cards.entity'

import { CreateDeckDto, GetAllDecksDto, UpdateDeckDto } from './dto'
import { GetRandomCardDto } from './dto/get-random-card.dto'
import {
  Deck,
  DeckWithAuthor,
  PaginatedDecks,
  PaginatedDecksWithMaxCardsCount,
} from './entities/deck.entity'
import { MinMaxCards } from './entities/min-max-cards.entity'
import { DecksRepository } from './infrastructure/decks.repository'
import {
  CreateCardCommand,
  CreateDeckCommand,
  DeleteDeckByIdCommand,
  GetAllCardsInDeckCommand,
  GetAllDecksV1Command,
  GetAllDecksV2Command,
  GetDeckByIdCommand,
  GetMinMaxCardsUseCaseCommand,
  GetRandomCardInDeckCommand,
  SaveGradeCommand,
  UpdateDeckCommand,
} from './use-cases'

@ApiTags('Decks')
@Controller('decks')
export class DecksController {
  constructor(
    private commandBus: CommandBus,
    private decksRepository: DecksRepository
  ) {}

  @HttpCode(HttpStatus.PARTIAL_CONTENT)
  @ApiOperation({
    description: 'Deprecated. Use v2 in combination with /min-max-cards request',
    summary: 'Paginated decks list',
    deprecated: true,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @Get()
  findAllV1(@Query() query: GetAllDecksDto, @Req() req): Promise<PaginatedDecksWithMaxCardsCount> {
    const finalQuery = Pagination.getPaginationData(query)

    return this.commandBus.execute(new GetAllDecksV1Command({ ...finalQuery, userId: req.user.id }))
  }

  @HttpCode(HttpStatus.PARTIAL_CONTENT)
  @ApiOperation({ description: 'Retrieve paginated decks list.', summary: 'Paginated decks list' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @Version('2')
  @Get()
  findAllV2(@Query() query: GetAllDecksDto, @Req() req): Promise<PaginatedDecks> {
    const finalQuery = Pagination.getPaginationData(query)

    return this.commandBus.execute(new GetAllDecksV2Command({ ...finalQuery, userId: req.user.id }))
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description: 'Retrieve the minimum and maximum amount of cards in a deck.',
    summary: 'Minimum and maximum amount of cards in a deck',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @Version('2')
  @Get('min-max-cards')
  findMinMaxCards(): Promise<MinMaxCards> {
    return this.commandBus.execute(new GetMinMaxCardsUseCaseCommand())
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
  ): Promise<PaginatedCardsWithGrade> {
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
    @Body()
    card: CreateCardDto,
    @UploadedFiles()
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
  ): Promise<CardWithGrade> {
    return this.commandBus.execute(
      new GetRandomCardInDeckCommand(req.user.id, id, query.previousCardId)
    )
  }

  @UseGuards(JwtAuthGuard)
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Card not found' })
  @HttpCode(HttpStatus.OK)
  @ApiNoContentResponse({ description: 'Grade saved' })
  @ApiOkResponse({
    description: 'A new random card in the deck. Will never return the same card that was sent',
    type: CardWithGrade,
  })
  @Post(':id/learn')
  @ApiOperation({
    description: 'Save the grade of a card',
    summary: 'Save the grade of a card',
  })
  async saveGrade(@Req() req, @Body() body: SaveGradeDto): Promise<CardWithGrade> {
    return await this.commandBus.execute(
      new SaveGradeCommand(req.user.id, { cardId: body.cardId, grade: body.grade })
    )
  }
}
