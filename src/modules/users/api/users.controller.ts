import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiTags } from '@nestjs/swagger'

import { Pagination } from '../../../infrastructure/common/pagination/pagination.service'
import { BaseAuthGuard } from '../../auth/guards'
import { CreateUserCommand } from '../../auth/use-cases'
import { CreateUserDto } from '../dto/create-user.dto'
import { UsersService } from '../services/users.service'

@ApiTags('Admin')
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private commandBus: CommandBus
  ) {}

  @Get()
  async findAll(@Query() query) {
    const { currentPage, itemsPerPage } = Pagination.getPaginationData(query)

    const users = await this.usersService.getUsers(
      currentPage,
      itemsPerPage,
      query.name,
      query.email
    )

    if (!users) throw new NotFoundException('Users not found')

    return users
  }

  @Get('/test-user-name')
  async testUserNamePage() {
    const user = await this.usersService.getUserByEmail('example@google.com')

    if (!user) throw new NotFoundException('Users not found')

    return prepareTemplate(user.name)
  }

  @UseGuards(BaseAuthGuard)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.commandBus.execute(
      new CreateUserCommand({
        name: createUserDto.name,
        email: createUserDto.email,
        password: createUserDto.password,
      })
    )
  }

  @UseGuards(BaseAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.usersService.deleteUserById(id)
  }

  @UseGuards(BaseAuthGuard)
  @Delete()
  async removeAll() {
    return await this.usersService.deleteAllUsers()
  }
}

const template = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<style>
*, *::before, *::after {
  box-sizing: border-box;
}
    :root {
        color-scheme: light dark;
        font-family: sans-serif;
    }
    main {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap:1rem;
        height: 100svh;
    }
</style>

<body>

<main>
  <div>
    Current test account username is <strong>{{testUserName}}</strong>
  </div>
  <button id="copy-test-user-name">Copy to clipboard</button>
</main>
</body>
<script>
  const button = document.getElementById('copy-test-user-name')
  button.addEventListener('click', () => {
    navigator.clipboard.writeText("{{testUserName}}").then(() =>{
      button.innerText = 'Copied!'
      setTimeout(() => {
        button.innerText = 'Copy to clipboard'
      }, 2000)
    })
  })
</script>
</html>`

function prepareTemplate(username: string) {
  return template.replaceAll('{{testUserName}}', username)
}
