// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'dynamics-market-backend',
      script: './dist/main.js',
      instances: 'max', // core lar soniga qarab
      exec_mode: 'cluster', // cluster mode
    },
  ],
};
