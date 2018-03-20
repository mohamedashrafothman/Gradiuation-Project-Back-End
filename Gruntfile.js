module.exports = function (grunt) {
	require('load-grunt-tasks')(grunt);

	// Tasks configuration.
	grunt.initConfig({
		'concat': {
			js: {
				src: ['public/scripts/*.js'],
				dest: 'public/build/script.js',
			},
			css: {
				src: ['public/css/*.css'],
				dest: 'public/build/style.css',
			},
		},
		'sass': {
			build: {
				files: [{
					src: ['public/sass/style.scss'],
					dest: 'public/css/style.css',
				}, ],
			},
		},
		'autoprefixer': {
			options: {
				browsers: ['last 2 versions', 'ie 8', 'ie 9']
			},
			my_target: {
				files: [{
					src: 'public/css/style.css',
					dest: 'public/css/style.css'
				}]
			}
		},
		'cssmin': {
			build: {
				files: {
					'public/build/style.min.css': [
						'public/build/style.css',
						'public/build/!*.min.css',
					],
				},
			},
		},
		'uglify': {
			my_target: {
				files: [{
					src: ['public/scripts/script.js'],
					dest: 'public/scripts/script.min.js',
				}]
			},
		},
		'eslint': {
			all: ['public/scripts/script.js', '!node_modules/**/*.js']
		},
		// 'imagemin': {
		// 	dynamic: {
		// 		files: [{
		// 			expand: true,
		// 			cwd: 'img/',
		// 			src: ['**/*.{png,jpg,jpeg,gif}'],
		// 			dest: 'build/img/'
		// 		}]
		// 	}
		// },
		// 'connect': {
		// 	server: {
		// 		options: {
		// 			hostname: 'localhost',
		// 			port: 9000,
		// 			base: './',
		// 			livereload: true
		// 		}
		// 	}
		// },
		'browserify': {
			dist: {
				files: {
					// destination for transpiled js : source js
					'public/build/script.js': 'public/scripts/**/*.es6'
				},
				options: {
					transform: [['babelify', { presets: 'es2015' }]],
					browserifyOptions: {
						debug: true
					}
				}
			}
		},
		'watch': {
			sass: {
				files: ['public/sass/**/*.scss'],
				tasks: ['sass', 'autoprefixer', 'concat:css', 'cssmin']
			},
			// eslint: {
			// 	files: 'public/scripts/*.js',
			// 	tasks: ['eslint', 'uglify'] //'browserify:dist',
			// },
			// imagemin: {
			// 	files: ['src/images/*.{png,jpeg,jpg,gif}'],
			// 	tasks: ['imagemin']
			// }
		},
	});


	// Load the plugins that provides the tasks.
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-newer');
	grunt.loadNpmTasks('grunt-sass');


	// Default task(s).
	grunt.registerTask('default', ['watch']);
};