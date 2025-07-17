import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from 'src/api/domain/entities/userRelations-entities/tags.entity';
import { TagDto } from 'src/api/domain/dtos/tagDTO/tag.dto';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async findAll(): Promise<TagDto[]> {
    const tags = await this.tagRepository.find();
    return tags.map(tag => ({ id: tag.id, name: tag.name }));
  }

  async create(name: string): Promise<TagDto> {
    const tag = this.tagRepository.create({ name });
    await this.tagRepository.save(tag);
    return { id: tag.id, name: tag.name };
  }

  async update(id: number, name: string): Promise<TagDto> {
    const tag = await this.tagRepository.findOne({ where: { id } });
    if (!tag) throw new NotFoundException('Tag não encontrada');
    tag.name = name;
    await this.tagRepository.save(tag);
    return { id: tag.id, name: tag.name };
  }

  async remove(id: number): Promise<void> {
    await this.tagRepository.delete(id);
  }

  async seedDefaultTags(): Promise<void> {
    const defaultTags = [
      'frontend', 'backend', 'ux', 'engenharia', 'Recursos Humanos', 'Ética',
      'Gestão de Projetos', 'Marketing', 'Vendas', 'Suporte',
      'Financeiro', 'Jurídico', 'Inovação', 'TI', 'Operações', 'Logística',
      'Comercial', 'Administrativo', 'Comunicação', 'Design', 'Dados', 'Produto'
    ];
    for (const name of defaultTags) {
      const exists = await this.tagRepository.findOne({ where: { name } });
      if (!exists) {
        const tag = this.tagRepository.create({ name });
        await this.tagRepository.save(tag);
      }
    }
  }
}
