import { publishToQueue } from '../config/rabbit';

// Fires after user is created — user-service listens on this queue
export async function publishUserCreated(data: {
  userId: number;
  email: string;
  name: string;
  phone: number;
}) {
  await publishToQueue('user.created', data);
}

// Fires when user logs in — auth-service listens on this queue
export async function publishUserLogin(data: {
  userId: number;
  email: string;
  name: string;
  phone: number;
}) {
  await publishToQueue('user.login', data);
}