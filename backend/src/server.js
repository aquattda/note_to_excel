const { createApp } = require('./app');
const env = require('./config/env');
const { connectToDatabase } = require('./config/db');
const { excelSyncService } = require('./services/serviceContainer');

async function bootstrap() {
  await connectToDatabase(env.mongoUri);
  await excelSyncService.enqueueSync('bootstrap');

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`Backend listening on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to bootstrap backend', error);
  process.exit(1);
});
