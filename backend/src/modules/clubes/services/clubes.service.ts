import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, type Repository } from 'typeorm';
import { isUniqueConstraintViolation } from '../../../core/validation/is-unique-constraint-violation.js';
import { CriarClubeDto } from '../dto/criar-clube.dto.js';
import { ClubeResponse } from '../dto/clube-response.js';
import { Clube } from '../entities/clube.entity.js';
import { validateClubCreation } from '../validators/clube.validators.js';

const CLUB_LIMIT = 20;

function normalizeNameForSorting(name: string): string[] {
  return Array.from(
    name
      .normalize('NFD')
      .toLowerCase()
      .replace(/\p{Mn}/gu, ''),
  );
}

function compareNames(firstName: string, secondName: string): number {
  const firstCharacters = normalizeNameForSorting(firstName);
  const secondCharacters = normalizeNameForSorting(secondName);
  const sharedLength = Math.min(
    firstCharacters.length,
    secondCharacters.length,
  );

  for (let index = 0; index < sharedLength; index += 1) {
    const difference =
      firstCharacters[index].codePointAt(0)! -
      secondCharacters[index].codePointAt(0)!;

    if (difference !== 0) {
      return difference;
    }
  }

  return firstCharacters.length - secondCharacters.length;
}

@Injectable()
export class ClubesService {
  constructor(
    @InjectRepository(Clube)
    private readonly clubsRepository: Repository<Clube>,
    private readonly dataSource: DataSource,
  ) {}

  async create(input: CriarClubeDto): Promise<ClubeResponse> {
    const clubData = validateClubCreation(input);

    try {
      const club = await this.dataSource.transaction(async (manager) => {
        // O bloqueio impede duas criações simultâneas de ultrapassarem o limite.
        await manager.query('LOCK TABLE "clubes" IN SHARE ROW EXCLUSIVE MODE');

        const clubsRepository = manager.getRepository(Clube);

        if ((await clubsRepository.count()) >= CLUB_LIMIT) {
          throw new ConflictException('O limite de 20 clubes foi atingido');
        }

        const newClub = clubsRepository.create({
          nome: clubData.name,
          sigla: clubData.acronym,
        });

        return clubsRepository.save(newClub);
      });

      return this.present(club);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      if (isUniqueConstraintViolation(error)) {
        throw new ConflictException('Nome ou sigla do clube já cadastrado');
      }

      throw error;
    }
  }

  async findAll(): Promise<ClubeResponse[]> {
    const clubs = await this.clubsRepository.find();
    clubs.sort(
      (first, second) =>
        compareNames(first.nome, second.nome) || first.id - second.id,
    );

    return clubs.map((club) => this.present(club));
  }

  async findById(id: number): Promise<ClubeResponse> {
    const club = await this.clubsRepository.findOneBy({ id });

    if (!club) {
      throw new NotFoundException('Clube não encontrado');
    }

    return this.present(club);
  }

  private present(club: Clube): ClubeResponse {
    return {
      id: club.id,
      name: club.nome,
      acronym: club.sigla.trimEnd(),
      cash: Number(club.caixa),
    };
  }
}
