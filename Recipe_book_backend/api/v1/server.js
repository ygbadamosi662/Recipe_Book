import generalRoutes from  './routes/index.js';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 1245;
// Enable cors
app.use(
    cors({
      origin: 'https://127.0.0.1:3000',
      methods: 'GET,POST',
      credentials: true, // Include cookies in CORS requests
      optionsSuccessStatus: 204, // Respond with a 204 status for preflight requests
    })
  );

app.use(express.json());

// maps all routes to our express app
generalRoutes(app);

app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`);
});

// exports for es6 and commonjs
export default app;
