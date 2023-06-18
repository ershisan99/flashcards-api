import { Body, Controller, Delete, Get, Param, Patch, Req, UseGuards } from '@nestjs/common'
import { CardsService } from './cards.service'
import { UpdateCardDto } from './dto/update-card.dto'
import { CommandBus } from '@nestjs/cqrs'
import { DeleteDeckByIdCommand, GetDeckByIdCommand, UpdateDeckCommand } from './use-cases'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('cards')
export class CardsController {
  constructor(private readonly decksService: CardsService, private commandBus: CommandBus) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commandBus.execute(new GetDeckByIdCommand(id))
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeckDto: UpdateCardDto, @Req() req) {
    return this.commandBus.execute(new UpdateDeckCommand(id, updateDeckDto, req.user.id))
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.commandBus.execute(new DeleteDeckByIdCommand(id, req.user.id))
  }
}
