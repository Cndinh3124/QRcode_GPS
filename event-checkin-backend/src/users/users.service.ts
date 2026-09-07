import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';

import { Role } from '../roles/entities/role.entity';

import {
  CreateUserDto,
} from './dto/create-user.dto';

import {
  UpdateUserDto,
} from './dto/update-user.dto';

import {
  ChangePasswordDto,
} from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  // =========================================================
  // CREATE USER
  // =========================================================

  async create(
    dto: CreateUserDto,
  ) {
    const studentCode =
      dto.studentCode?.trim();

    const fullName =
      dto.fullName?.trim();

    const email =
      dto.email?.trim().toLowerCase();

    if (!studentCode) {
      throw new BadRequestException(
        'Student code is required.',
      );
    }

    if (!fullName) {
      throw new BadRequestException(
        'Full name is required.',
      );
    }

    if (!email) {
      throw new BadRequestException(
        'Email is required.',
      );
    }

    const existingEmail =
      await this.userRepository.findOne({
        where: {
          email,
        },
      });

    if (existingEmail) {
      throw new ConflictException(
        'Email already exists.',
      );
    }

    const existingStudentCode =
      await this.userRepository.findOne({
        where: {
          studentCode,
        },
      });

    if (existingStudentCode) {
      throw new ConflictException(
        'Student code already exists.',
      );
    }

    const role =
      await this.roleRepository.findOne({
        where: {
          name: dto.role,
        },
      });

    if (!role) {
      throw new NotFoundException(
        'Role not found.',
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        dto.password,
        10,
      );

    const user =
      this.userRepository.create({
        studentCode,
        fullName,
        email,
        password: hashedPassword,
        isActive:
          dto.isActive ??
          true,
        role,
      });

    const savedUser =
      await this.userRepository.save(
        user,
      );

    return this.toPublicUser(
      savedUser,
    );
  }

  // =========================================================
  // FIND ALL
  // =========================================================

  async findAll() {
    const users =
      await this.userRepository.find({
        relations: {
          role: true,
        },
        order: {
          createdAt: 'DESC',
        },
      });

    return users.map(
      (user) =>
        this.toPublicUser(user),
    );
  }

  // =========================================================
  // FIND ONE
  // =========================================================

  async findOne(
    id: string,
  ) {
    if (!id?.trim()) {
      throw new BadRequestException(
        'User ID is required.',
      );
    }

    const user =
      await this.userRepository.findOne({
        where: {
          id,
        },
        relations: {
          role: true,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'User not found.',
      );
    }

    return user;
  }

  // =========================================================
  // FIND BY EMAIL
  // =========================================================

  async findByEmail(
    email: string,
  ) {
    if (!email?.trim()) {
      return null;
    }

    return this.userRepository.findOne({
      where: {
        email:
          email.trim().toLowerCase(),
      },
      relations: {
        role: true,
      },
    });
  }

  // =========================================================
  // FIND BY ID
  // =========================================================

  async findById(
    id: string,
  ) {
    if (!id?.trim()) {
      return null;
    }

    return this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        role: true,
      },
    });
  }

  // =========================================================
  // GET MY PROFILE
  // =========================================================

  async getMyProfile(
    userId: string,
  ) {
    if (!userId?.trim()) {
      throw new BadRequestException(
        'User ID is required.',
      );
    }

    const user =
      await this.userRepository.findOne({
        where: {
          id: userId,
        },
        relations: {
          role: true,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'User not found.',
      );
    }

    return this.toPublicUser(
      user,
    );
  }

  // =========================================================
  // UPDATE MY PROFILE
  // =========================================================

  async updateMyProfile(
    userId: string,
    dto: UpdateUserDto,
  ) {
    if (!userId?.trim()) {
      throw new BadRequestException(
        'User ID is required.',
      );
    }

    const user =
      await this.userRepository.findOne({
        where: {
          id: userId,
        },
        relations: {
          role: true,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'User not found.',
      );
    }

    if (
      dto.fullName !==
      undefined
    ) {
      const fullName =
        dto.fullName.trim();

      if (!fullName) {
        throw new BadRequestException(
          'Full name cannot be empty.',
        );
      }

      user.fullName =
        fullName;
    }

    if (
      dto.email !==
      undefined
    ) {
      const email =
        dto.email
          .trim()
          .toLowerCase();

      if (!email) {
        throw new BadRequestException(
          'Email cannot be empty.',
        );
      }

      const existing =
        await this.userRepository.findOne({
          where: {
            email,
          },
        });

      if (
        existing &&
        existing.id !== user.id
      ) {
        throw new ConflictException(
          'Email already exists.',
        );
      }

      user.email =
        email;
    }

    const savedUser =
      await this.userRepository.save(
        user,
      );

    return this.toPublicUser(
      savedUser,
    );
  }

  // =========================================================
  // CHANGE PASSWORD
  // =========================================================

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ) {
    if (!userId?.trim()) {
      throw new BadRequestException(
        'User ID is required.',
      );
    }

    const user =
      await this.userRepository.findOne({
        where: {
          id: userId,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'User not found.',
      );
    }

    const passwordValid =
      await bcrypt.compare(
        dto.currentPassword,
        user.password,
      );

    if (!passwordValid) {
      throw new BadRequestException(
        'Current password is incorrect.',
      );
    }

    const samePassword =
      await bcrypt.compare(
        dto.newPassword,
        user.password,
      );

    if (samePassword) {
      throw new BadRequestException(
        'New password must be different from current password.',
      );
    }

    user.password =
      await bcrypt.hash(
        dto.newPassword,
        10,
      );

    await this.userRepository.save(
      user,
    );

    return {
      success: true,
      message:
        'Password changed successfully.',
    };
  }

  // =========================================================
  // UPDATE USER
  // =========================================================

  async update(
    id: string,
    dto: UpdateUserDto,
  ) {
    const user =
      await this.userRepository.findOne({
        where: {
          id,
        },
        relations: {
          role: true,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'User not found.',
      );
    }

    if (
      dto.fullName !==
      undefined
    ) {
      user.fullName =
        dto.fullName.trim();
    }

    if (
      dto.email !==
      undefined
    ) {
      const email =
        dto.email
          .trim()
          .toLowerCase();

      const existing =
        await this.userRepository.findOne({
          where: {
            email,
          },
        });

      if (
        existing &&
        existing.id !== id
      ) {
        throw new ConflictException(
          'Email already exists.',
        );
      }

      user.email =
        email;
    }

    if (
      dto.isActive !==
      undefined
    ) {
      user.isActive =
        dto.isActive;
    }

    if (
      dto.password
    ) {
      user.password =
        await bcrypt.hash(
          dto.password,
          10,
        );
    }

    if (
      dto.role
    ) {
      const role =
        await this.roleRepository.findOne({
          where: {
            name: dto.role,
          },
        });

      if (!role) {
        throw new NotFoundException(
          'Role not found.',
        );
      }

      user.role =
        role;
    }

    const savedUser =
      await this.userRepository.save(
        user,
      );

    return this.toPublicUser(
      savedUser,
    );
  }

  // =========================================================
  // REMOVE USER
  // =========================================================

  async remove(
    id: string,
  ) {
    const user =
      await this.userRepository.findOne({
        where: {
          id,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'User not found.',
      );
    }

    await this.userRepository.remove(
      user,
    );

    return {
      success: true,
      message:
        'User deleted successfully.',
    };
  }

  // =========================================================
  // PUBLIC USER RESPONSE
  // =========================================================

  private toPublicUser(
    user: User,
  ) {
    return {
      id: user.id,

      studentCode:
        user.studentCode,

      fullName:
        user.fullName,

      email:
        user.email,

      isActive:
        user.isActive,

      role: user.role
        ? {
            id:
              user.role.id,

            name:
              user.role.name,

            description:
              user.role.description,
          }
        : null,

      createdAt:
        user.createdAt,

      updatedAt:
        user.updatedAt,
    };
  }
}