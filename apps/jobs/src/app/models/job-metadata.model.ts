import { ObjectType, Field } from '@jobber/graphql';

@ObjectType()
export class JobMetadata {
  @Field()
  name: string;

  @Field()
  description: string;
}
