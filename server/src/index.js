import dotenv from 'dotenv';

dotenv.config();

const { default: app } = await import('./app.js');

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`TaleCrafter API is running on port ${port}`);
});
