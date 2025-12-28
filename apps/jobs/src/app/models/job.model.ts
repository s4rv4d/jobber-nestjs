import { ObjectType, Field } from '@jobber/graphql';

@ObjectType()
export class JobModel {
  @Field()
  name: string;

  @Field()
  description: string;
}
