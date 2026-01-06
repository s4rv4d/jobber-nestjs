import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as catSchema from './schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class CategoriesService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof catSchema>
  ) {}

  async getCategoryByName(name: string) {
    return await this.database.query.categories.findFirst({
      where: eq(catSchema.categories.name, name),
    });
  }
}
