import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  
  app.enableShutdownHooks();

  
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);


  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:4200',
    credentials: true,
  });

  const port = Number(process.env.PORT ?? 3000);

  await app.listen(port, '0.0.0.0');

  console.log(`API running at http://localhost:${port}`);
  console.log(`GraphQL running at http://localhost:${port}/graphql`);
}

bootstrap().catch((error: unknown) => {
  console.error('Failed to start API', error);
  process.exit(1);
});