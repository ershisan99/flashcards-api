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
  UseGuards,
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
} from './use-cases'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { GetAllDecksDto } from './dto/get-all-decks.dto'
import { GetAllCardsInDeckDto } from '../cards/dto/get-all-cards.dto'
import { CreateCardCommand } from './use-cases'
import { CreateCardDto } from '../cards/dto/create-card.dto'
import { Pagination } from '../../infrastructure/common/pagination/pagination.service'

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
    return this.commandBus.execute(new GetAllCardsInDeckCommand(req.user.id, id, query))
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cards')
  createCardInDeck(@Param('id') id: string, @Req() req, @Body() card: CreateCardDto) {
    return this.commandBus.execute(new CreateCardCommand(req.user.id, id, card))
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
