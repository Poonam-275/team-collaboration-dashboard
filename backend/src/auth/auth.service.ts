import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as firebase from 'firebase-admin';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private firebaseApp: firebase.app.App;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    const firebaseConfig = {
      projectId: this.configService.get('FIREBASE_PROJECT_ID'),
      privateKey: this.configService.get('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
      clientEmail: this.configService.get('FIREBASE_CLIENT_EMAIL'),
    };

    this.firebaseApp = firebase.initializeApp({
      credential: firebase.credential.cert(firebaseConfig),
    });
  }

  async validateFirebaseToken(firebaseToken: string): Promise<User> {
    try {
      const decodedToken = await this.firebaseApp.auth().verifyIdToken(firebaseToken);
      const { email, name, picture } = decodedToken;

      let user = await this.usersService.findByEmail(email);
      
      if (!user) {
        user = await this.usersService.create({
          email,
          name: name || email.split('@')[0],
          avatar: picture,
          role: 'user',
        });
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }

  async generateJwtToken(user: User): Promise<string> {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    };
    return this.jwtService.sign(payload);
  }

  async validateJwtPayload(payload: any): Promise<User> {
    return this.usersService.findById(payload.sub);
  }
}
