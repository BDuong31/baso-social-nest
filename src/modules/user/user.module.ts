import { Module, Provider } from '@nestjs/common';
import { config } from 'src/share';
import { JwtTokenService } from 'src/share/components/jwt';
import { ShareModule } from 'src/share/module';
import { UserHttpController, UserRpcHttpController } from './user-http.controller';
import { UserPrismaRepository } from './user-prisma.repo';
import { TOKEN_PROVIDER, USER_REPOSITORY, USER_SERVICE } from './user.di-token';
import { UserService } from './user.service';
import { GoogleStrategy } from './google.strategy';
import { ConfigModule } from '@nestjs/config';

// Khai báo các Provider
const repositories: Provider[] = [
  { provide: USER_REPOSITORY, useClass: UserPrismaRepository },
];

// Khai báo các Service
const services: Provider[] = [
  { provide: USER_SERVICE, useClass: UserService },
];

// Khai báo Provider tạo và xác thực token
const tokenJWTProvider = new JwtTokenService(config.rpc.jwtSecret, '7d');
const tokenProvider: Provider = { provide: TOKEN_PROVIDER, useValue: tokenJWTProvider };

// Khai báo Module User
@Module({
  imports: [ShareModule, ConfigModule],
  controllers: [UserHttpController, UserRpcHttpController],
  providers: [...repositories, ...services, tokenProvider, GoogleStrategy],
})

export class UserModule {}
