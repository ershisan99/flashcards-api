import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { UsersRepository } from '../../users/infrastructure/users.repository';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly usersRepository: UsersRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.headers || !request.headers.authorization) {
      throw new BadRequestException([{ message: 'No any auth headers' }]);
    }
    const authorizationData = request.headers.authorization.split(' ');
    const token = authorizationData[1];
    const tokenName = authorizationData[0];
    if (tokenName != 'Bearer') {
      throw new UnauthorizedException([
        {
          message: 'login or password invalid',
        },
      ]);
    }
    try {
      const secretKey = process.env.JWT_SECRET_KEY;
      const decoded: any = jwt.verify(token, secretKey!);
      const user = await this.usersRepository.findUserById(decoded.userId);
      if (!user) {
        throw new NotFoundException([
          {
            field: 'token',
            message: 'user not found',
          },
        ]);
      }
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException([
        {
          message: 'login or password invalid',
        },
      ]);
    }
    return true;
  }
}
