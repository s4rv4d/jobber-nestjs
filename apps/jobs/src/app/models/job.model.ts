import { ObjectType, Field } from '@jobber/graphql';

@ObjectType()
export class Job {
  @Field()
  id: number;

  @Field()
  name: string;

  @Field()
  size: number;

  @Field()
  completed: number;

  @Field()
  status: string;

  @Field()
  startedAt: Date;

  @Field({ nullable: true })
  endedAt?: Date;
}
