import { NestFactory } from "@nestjs/core";
import { AppModule } from "src/api/modules/app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import * as cookieParser from "cookie-parser";
import * as bodyParser from "body-parser";
import { join } from "path";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Expor a pasta uploads como estática
  app.useStaticAssets(join(process.cwd(), "uploads"), { prefix: "/uploads/" });

  app.use(cookieParser());

  app.use(bodyParser.json({ limit: "10mb" }));
  app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get<string>("FRONTEND_URL") ||
      "http://localhost:3000",
    credentials: true,
  });

  const port = configService.get<number>("PORT") || 3001;

  const config = new DocumentBuilder()
    .setTitle("Kompartilha")
    .setDescription("API Original para o Projeto em andamento: KOMPARTILHA")
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Insira o token JWT no formato: Bearer <token>",
      },
      "JWT-auth",
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup("api/docs", app, document, {
    customSiteTitle: "Kompartilha API Docs",
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: "none",
    },
  });

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(
      `📚 Documentação disponível em http://localhost:${port}/api/docs`,
    );
  });
}

bootstrap();
