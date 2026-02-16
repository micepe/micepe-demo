import express from 'express';
import path from 'path';

const __dirname = import.meta.dirname;

const app = express();
const port = parseInt(process.env.PORT ?? "3030", 10);

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, './dist')));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});