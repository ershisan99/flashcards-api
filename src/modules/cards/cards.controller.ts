import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { CardsService } from './cards.service'
import { UpdateCardDto } from './dto/update-card.dto'
import { CommandBus } from '@nestjs/cqrs'
import { DeleteCardByIdCommand, GetDeckByIdCommand, UpdateCardCommand } from './use-cases'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { FileFieldsInterceptor } from '@nestjs/platform-express'

@Controller('cards')
export class CardsController {
  constructor(private readonly decksService: CardsService, private commandBus: CommandBus) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commandBus.execute(new GetDeckByIdCommand(id))
  }

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
  ) {
    console.log({ body })
    console.log(files)
    return this.commandBus.execute(
      new UpdateCardCommand(id, body, req.user.id, files.answerImg[0], files.questionImg[0])
    )
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.commandBus.execute(new DeleteCardByIdCommand(id, req.user.id))
  }
}
