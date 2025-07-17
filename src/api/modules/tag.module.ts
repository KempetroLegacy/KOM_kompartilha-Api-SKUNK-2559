import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from 'src/api/domain/entities/userRelations-entities/tags.entity';
import { TagService } from 'src/api/services/tag.service';
import { TagController } from 'src/api/controllers/tag.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tag])],
  providers: [TagService],
  controllers: [TagController],
  exports: [TagService],
})
export class TagModule {}
