import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType({
  isAbstract: true,
})
export class AbstractModel {
  // its marks the id field as GraphQL ID type
  @Field(() => ID)
  id: number;
}
