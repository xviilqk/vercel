export type Appointment = {
  name: string;
  petBooked: string;
  date: string;
  time: string;
  status: 'pending' | 'completed';
};

export const mockAppointments: Appointment[] = [
  {
    name: 'Mica Hanna Longalong',
    petBooked: 'Cleo',
    date: '04/03/25',
    time: '10:00 AM',
    status: 'completed'
  },
  {
    name: 'John Paul Cerro',
    petBooked: 'Milo',
    date: '04/01/25',
    time: '1:00 PM',
    status: 'completed'
  },
  {
    name: 'Elisha Nicole San Juan',
    petBooked: 'Nala',
    date: '04/05/25',
    time: '2:00 PM',
    status: 'pending'
  },
];