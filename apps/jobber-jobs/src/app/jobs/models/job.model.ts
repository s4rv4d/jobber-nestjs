import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class JobModel {
  @Field()
  name: string;

  @Field()
  description: string;
}
