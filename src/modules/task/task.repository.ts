import { v4 as uuid } from 'uuid';

export class TaskRepository {
  async save(filePath: string) {
    const taskId = uuid();

    // TODO: dodać zapis do mongodb

    return taskId;
  }
}
