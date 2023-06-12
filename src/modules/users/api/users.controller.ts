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
import { UsersService } from '../services/users.service'
import { CreateUserDto } from '../dto/create-user.dto'
import { Pagination } from '../../../infrastructure/common/pagination.service'
import { BaseAuthGuard } from '../../auth/guards/base-auth.guard'

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async findAll(@Query() query) {
    const { page, pageSize, searchNameTerm, searchEmailTerm } = Pagination.getPaginationData(query)
    const users = await this.usersService.getUsers(page, pageSize, searchNameTerm, searchEmailTerm)
    if (!users) throw new NotFoundException('Users not found')
    return users
  }

  //@UseGuards(BaseAuthGuard)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.createUser(
      createUserDto.login,
      createUserDto.password,
      createUserDto.email
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
