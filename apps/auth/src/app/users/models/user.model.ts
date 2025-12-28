import { Field, ObjectType, AbstractModel } from '@jobber/graphql';

@ObjectType()
export class User extends AbstractModel {
  @Field()
  email: string;
}
