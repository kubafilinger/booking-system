export class ReservationProcessFailedEvent {
  constructor(
    public readonly taskId: string,
    public readonly reservationId: string,
    public readonly row: number,
    public readonly errors: string[],
  ) {}
}
