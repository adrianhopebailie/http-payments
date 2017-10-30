module.exports = function(grunt) {
  
    // Project configuration.
    grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      watch: {
        scripts: {
          files: ['http-payments.md'],
          tasks: ['kramdown_rfc2629'],
          options: {
            spawn: false,
          },
        },
      },
      kramdown_rfc2629: {
        options: {
          outputs: ['text', 'html'],
          outputDir: '.',
          removeXML: false
        },
        your_target: {
          src: ['http-payments.md']
        },
      },
    });
  
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-kramdown-rfc2629');
  
  };