import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as productsSchema from './schema';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof productsSchema>,
    private readonly categoriesService: CategoriesService
  ) {}

  async createProduct(
    product: Omit<typeof productsSchema.products.$inferSelect, 'id'>
  ) {
    const category = await this.categoriesService.getCategoryByName(
      product.category
    );

    await this.database.insert(productsSchema.products).values({
      ...product,
      price: category ? product.price + category.charge : product.price,
    });
  }
}
