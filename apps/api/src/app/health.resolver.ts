import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class HealthResolver {
  @Query(() => String, {
    description: 'Checks whether the API is running',
  })
  health(): string {
    return 'Hivemind API is healthy';
  }
}