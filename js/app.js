require.config({
  baseUrl: 'js/lib',
  paths: {
    app: '../app'
  },
  'shim': {
    'jquery': { exports: '$' },
    'jquery-ui': { exports: '$' }
  }
});

require(['jquery', 'jquery-ui', 'app/main', 'app/fx']);
