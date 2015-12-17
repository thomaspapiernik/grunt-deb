var deb = require('debian-packaging'),
    path = require('path'),
    fs = require('fs-extra'),
    crypto = require('crypto'),
    isValid = require('../lib/checkOptions');

module.exports = function (grunt) {

    var uploadersToList = function(uploaders) {
        if (!uploaders) {
            return '';
        }
        if (!uploaders.map) {
            return uploaders;
        }

        return uploaders.map(function(uploader) {
            return (uploader.name ? uploader.name + (uploader.email ? ' <' + uploader.email + '>' : '') : uploader);
        }).join(',');
    };

    grunt.registerMultiTask('deb_package', function(){

        var done = this.async();

        var pkg = grunt.file.readJSON('package.json'),
            options = this.options({
                maintainer: process.env.DEBFULLNAME && process.env.DEBEMAIL && {
                    name: process.env.DEBFULLNAME,
                    email: process.env.DEBEMAIL
                } || pkg.author && pkg.author.name && pkg.author.email && pkg.author,
                uploaders: pkg.maintainers || "",
                name: pkg.name,
                short_description: (pkg.description && pkg.description.split(/\r\n|\r|\n/g)[0]) || '',
                long_description: (pkg.description && pkg.description.split(/\r\n|\r|\n/g).splice(1).join(' ')) || '',
                version: pkg.version,
                build_number: process.env.BUILD_NUMBER || process.env.DRONE_BUILD_NUMBER || process.env.TRAVIS_BUILD_NUMBER || '1',
                target_architecture: "all",
                category: "misc",
                dependencies: [],
                tmp_dir: '.tmp',
                output: './output/'
            });

        if (!isValid(grunt, options)) {
            return done(false);
        }

        options.data_dir = path.join(options.tmp_dir, 'data');
        options.control_dir = path.join(options.tmp_dir, 'control');
        options.template_dir = path.join(__dirname, 'template');
        options.md5sums_file = path.join(options.control_dir, 'md5sums');

        var md5sums = {};

        // Generate data file
        var file_list = this.files
            .forEach(function (file) {
                // Remove inexisting et folders
                var src = file.src.filter(function (src) {
                    if (file.cwd) {
                        src = path.join(file.cwd, src);
                    }
                    return grunt.file.exists(src) &&
                        grunt.file.isFile(src);
                }).forEach(function (src) {
                    var long_src = src;
                    if (file.cwd) {
                        long_src = path.join(file.cwd, src);
                    }
                    var hash = crypto.createHash('md5');
                    hash.update(grunt.file.read(long_src));
                    md5sums[path.join(file.dest, src)] = hash.digest('hex');
                    // Here we use fs-extra to keep the mode of the original file (Very useful for executables)
                    fs.copySync(long_src, path.join(options.data_dir, file.dest, src));
                });
            });

        var md5sumsContent = Object.keys(md5sums).reduce(function (total, file) {
            return total + md5sums[file] + '  ' + file + '\n';
        }, '');

        grunt.file.write(path.join(options.control_dir, 'md5sum'), md5sumsContent);

        for (var i in this.data.links) {
            fs.mkdirpSync(path.dirname(path.join(options.data_dir, i)));
            fs.symlinkSync(this.data.links[i], path.join(options.data_dir, i));
        }

        var long_description = options.long_description.replace(/\n/g, '\n ');
        long_description = long_description.length ? ' ' + long_description : '';

        var controlVars = {
            data: {
                name: options.name,
                version: options.version,
                maintainer: (options.maintainer.name ? options.maintainer.name + (options.maintainer.email ? ' <' + options.maintainer.email + '>' : '') : options.maintainer),
                uploaders: uploadersToList(options.uploaders),
                category: options.category,
                target_architecture: options.target_architecture,
                dependencies: options.dependencies.join(', '),
                short_description: options.short_description,
                long_description: long_description
            }
        };

        var templateContent = grunt.file.read(path.join(options.template_dir, 'control'));
            content = grunt.template.process(templateContent, controlVars);
        content = content.replace(/^\s*[\r\n]/gm, '');
        grunt.file.write(path.join(options.control_dir, 'control'), content);

        if (this.data.scripts) {
            // copy package lifecycle scripts
            var scripts = ['preinst', 'postinst', 'prerm', 'postrm'];

            for (var j in scripts) {
                if (this.data.scripts[scripts[j]]) {
                    var destination = path.join(options.control_dir, scripts[j]);
                    if (this.data.scripts[scripts[j]].src) {
                        grunt.verbose.writeln(scripts[j] + ' script found');
                        grunt.file.copy(this.data.scripts[scripts[j]].src, destination);
                    } else if (this.data.scripts[scripts[j]].content) {
                        grunt.verbose.writeln('Creating ' + scripts[j]);
                        grunt.file.write(destination, this.data.scripts[scripts[j]].content);
                    }
                }
            }
        }



        var output_file = options.name + '_' + options.version + '-' + options.build_number + '_' + options.target_architecture + '.deb';

        fs.mkdirpSync(options.output);

        deb.createPackage({
            control: options.control_dir,
            data: options.data_dir,
            dest: path.join(options.output, output_file)
        })
        .then(function () {
            grunt.file.delete(options.tmp_dir);
            done();
        })
        .catch(function (err) {
            grunt.file.delete(options.tmp_dir);
            done(err);
        });
    });
};
