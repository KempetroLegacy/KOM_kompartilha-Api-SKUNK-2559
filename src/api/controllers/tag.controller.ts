import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { TagService } from 'src/api/services/tag.service';
import { TagDto } from 'src/api/domain/dtos/tagDTO/tag.dto';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  async findAll(): Promise<TagDto[]> {
    return this.tagService.findAll();
  }

  @Post()
  async create(@Body('name') name: string): Promise<TagDto> {
    return this.tagService.create(name);
  }

  @Post('seed-default')
  async seedDefault(): Promise<{ message: string }> {
    await this.tagService.seedDefaultTags();
    return { message: 'Tags padrão populadas com sucesso!' };
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body('name') name: string): Promise<TagDto> {
    return this.tagService.update(Number(id), name);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.tagService.remove(Number(id));
  }
}
