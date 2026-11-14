import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
  ) {}

  async signup(dto: AuthDto) {
    // Generate the password hash
    const hash = await argon.hash(dto.password);

    try {
      // Save the new user in the db
      const user =
        await this.prismaService.user.create({
          data: {
            email: dto.email,
            hash,
          },
        });

      const { hash: _userHash, ...safeUser } =
        user;
      void _userHash;

      // return the saved user
      return safeUser;
    } catch (error) {
      if (
        error instanceof
        PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(
            'Credentials taken',
          );
        }
      }
      throw error;
    }
  }

  async signin(dto: AuthDto) {
    // Find the user by email
    const user =
      await this.prismaService.user.findUnique({
        where: {
          email: dto.email,
        },
      });

    // If user does not exist throw exception
    if (!user) {
      throw new ForbiddenException(
        'Credentials incorrect',
      );
    }

    // Compare password
    const pwMatches = await argon.verify(
      user.hash,
      dto.password,
    );

    // If password incorrect throw exception
    if (!pwMatches) {
      throw new ForbiddenException(
        'Credentials incorrect',
      );
    }

    // Send back the user
    const { hash: _userHash, ...safeUser } = user;
    void _userHash;

    return safeUser;
  }
}
