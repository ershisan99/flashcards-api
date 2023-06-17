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
import { CreateDeckCommand } from './use-cases'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { GetAllDecksCommand } from './use-cases/get-all-decks-use-case'
import { GetAllDecksDto } from './dto/get-all-decks.dto'
import { GetDeckByIdCommand } from './use-cases/get-deck-by-id-use-case'
import { DeleteDeckByIdCommand } from './use-cases/delete-deck-by-id-use-case'
import { UpdateDeckCommand } from './use-cases/update-deck-use-case'

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
    return this.commandBus.execute(new GetAllDecksCommand({ ...query, userId: req.user.id }))
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commandBus.execute(new GetDeckByIdCommand(id))
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
