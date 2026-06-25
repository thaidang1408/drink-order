import dotenv from 'dotenv';
import killPort from 'kill-port';

dotenv.config();

const port = Number(process.env.PORT || 3000);

try {
  await killPort(port);
  console.log(`[port:free] Cleared port ${port}`);
} catch {
  console.log(`[port:free] Port ${port} is already free`);
}
