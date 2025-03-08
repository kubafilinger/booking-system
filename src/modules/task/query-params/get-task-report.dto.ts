import { IsUUID } from 'class-validator';

export class GetTaskReportDto {
  @IsUUID()
  id: string;
}
