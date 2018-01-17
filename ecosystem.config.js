const path = require('path')

module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [

    // First application
    {
      name: 'Test Server',
      script: path.join(__dirname, 'public/index.js'),
      watch: ['public/index.js']
    },

  ]
};
