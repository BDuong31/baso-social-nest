<p align="center">
  <a href="https://youthscience.club/" target="blank"><img src="https://i.postimg.cc/xdK1Lc5R/logo.png" width="120" alt="Baso Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

<p align="center">A social media backend platform</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

This project is a backend platform for a social network, built with the [Nest](https://github.com/nestjs/nest) framework using TypeScript. The platform provides APIs to manage users, posts, comments, following, and many other features of a social network.
## Project setup

```bash
# install dependencies
$ pnpm install

# Start Docker comtainers
$ docker-compose up -d 

# Create .env file 
$ echo 'DATABASE_URL="postgresql://baso:baso_secret@localhost:5432/baso-social"' > .env

# Run Prisma migrations to apply database schema changes
$ pnpx prisma migrate dev

# Generate Prisma Client based on the schema
$ pnpx prisma generate
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```
