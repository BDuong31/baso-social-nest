import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createUser(@Body() data: Prisma.UserCreateInput) {
    return this.usersService.createUser(data);
  }

  @Get()
  getUsers() {
    return this.usersService.getUsers();
  }

  @Get(':id')
  getUserById(@Param('id') id: number) {
    return this.usersService.getUserById(id);
  }

  @Put(':id')
  updateUser(@Param('id') id: number, @Body() data: Prisma.UserUpdateInput) {
    return this.usersService.updateUser(id, data);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: number) {
    return this.usersService.deleteUser(id);
  }
}
