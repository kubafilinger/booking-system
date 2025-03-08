export enum ReservationStatus {
  Pending = 'oczekująca',
  Completed = 'zrealizowana',
  Canceled = 'anulowana',
}

export type Reservation = {
  reservationId: string;
  guestName: string;
  status: ReservationStatus;
  checkInDate: Date;
  checkOutDate: Date;
};
