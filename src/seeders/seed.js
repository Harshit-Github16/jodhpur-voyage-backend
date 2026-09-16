import resetCleanDatabase from './resetCleanDatabase.js';

resetCleanDatabase()
  .then(() => {
    console.log('🎉 Seeder completed successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
