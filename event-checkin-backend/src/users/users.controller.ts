import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';

import type { Request } from 'express';

import { UsersService } from './users.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email?: string;
  };
}

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  // =========================================================
  // CREATE USER
  // POST /users
  // =========================================================

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(
    @Body() dto: CreateUserDto,
  ) {
    return this.usersService.create(dto);
  }

  // =========================================================
  // FIND ALL USERS
  // GET /users
  // =========================================================

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ORGANIZER')
  findAll() {
    return this.usersService.findAll();
  }

  // =========================================================
  // GET MY PROFILE
  // GET /users/me
  // =========================================================

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMyProfile(
    @Req() req: AuthenticatedRequest,
  ) {
    return this.usersService.getMyProfile(
      req.user.id,
    );
  }

  // =========================================================
  // UPDATE MY PROFILE
  // PATCH /users/me
  // =========================================================

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMyProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateMyProfile(
      req.user.id,
      dto,
    );
  }

  // =========================================================
  // CHANGE MY PASSWORD
  // PATCH /users/me/password
  // =========================================================

  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(
      req.user.id,
      dto,
    );
  }

  // =========================================================
  // FIND ONE USER
  // GET /users/:id
  // =========================================================

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ORGANIZER')
  findOne(
    @Param('id') id: string,
  ) {
    return this.usersService.findOne(id);
  }

  // =========================================================
  // UPDATE USER
  // PATCH /users/:id
  // =========================================================

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(
      id,
      dto,
    );
  }

  // =========================================================
  // DELETE USER
  // DELETE /users/:id
  // =========================================================

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(
    @Param('id') id: string,
  ) {
    return this.usersService.remove(id);
  }
}