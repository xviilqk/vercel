// /app/data/mockAppointments.ts

export type Appointment = {
  name: string;
  petBooked: string;
  date: string;
  time: string;
};

export const appointments: Appointment[] = [
  {
    name: 'Mica Hanna Longalong',
    petBooked: 'Cleo',
    date: '04/03/25',
    time: '10:00 AM',
  },
  {
    name: 'John Paul Cerro',
    petBooked: 'Milo',
    date: '04/01/25',
    time: '1:00 PM',
  },
];

export const todayAppointment = {
  name: 'Elisha Nicole San Juan',
  time: '2:00 PM',
};