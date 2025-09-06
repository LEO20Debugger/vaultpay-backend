import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  await app.listen(ConfigService.app.port);
  console.log(
    `Application is running on: http://localhost:${ConfigService.app.port}`,
  );
}
bootstrap();
