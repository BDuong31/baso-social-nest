import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback, StrategyOptions } from "passport-google-oauth20"; //Import StrategyOptions
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(configService: ConfigService) {
    super({
      clientID: "697579782317-tjcpc3k2in99vskgkbgms4jsv1o8ro2l.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://localhost:3000/api/auth/callback/google",
      scope: ["email", "profile"],
      passReqToCallback: false,
    } as StrategyOptions); // Type cast to StrategyOptions
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, emails, name, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      username: emails[0].value.split("@")[0],
      avatar: photos[0].value,
      password: "000000",
    };
    done(null, user);
  }
}