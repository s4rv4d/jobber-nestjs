import { IsNotEmpty } from 'class-validator';
import { Field, InputType } from '@jobber/graphql';
import JSON from 'graphql-type-json';

@InputType()
export class ExecuteJobInput {
  @Field()
  @IsNotEmpty()
  name: string;

  @Field(() => JSON)
  @IsNotEmpty()
  data: object | object[];
}
