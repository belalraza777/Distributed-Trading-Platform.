import axios from 'axios';

const USER_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const INTERNAL_SECRET = process.env.INTERNAL_SERVICE_SECRET || 'internal-secret';

// calls auth/user service internal route — no JWT needed, uses shared secret
export async function getUserById(userId: number) {
  const res = await axios.get(`${USER_URL}/${userId}`, {
    headers: { 'x-internal-secret': INTERNAL_SECRET },
  });
  return res.data.data; // { id, name, email, createdAt, updatedAt }
}

getUserById(1).then((user) => console.log(user)).catch((err) => console.error(err));