import { IsUUID } from 'class-validator';

export class GetTaskStatusDto {
  @IsUUID()
  id: string;
}
