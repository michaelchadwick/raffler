require.config({
  'baseUrl': 'js/lib',
  'paths': {
    'app': '../app'
  },
  'shim': {
    'jquery': { exports: '$' },
    'jquery-ui': { exports: '$' }
  }
});

// Load main app module to start the app
require(['app/main']);
