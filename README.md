# grunt-deb
>Performs cross platform debian packaging

[![NPM](https://nodei.co/npm/grunt-deb.png)](https://npmjs.org/package/grunt-deb)

[![Build Status](https://img.shields.io/jenkins/s/http/ci.paulvarache.ninja/grunt-deb.svg)](http://ci.paulvarache.ninja/job/grunt-deb/)

This task allows you to create your .deb without debhelper or Java. It's pure javascript. You only need `tar` and `ar`.

## Getting started

This plugin requires Grunt `~0.4`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-deb --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-deb');
```

## The `deb_package` task
###Overview
In your Gruntfile (inside the initConfig object), add a section named `deb_package`.

A lot of options in this section are provided by the `package.json` file, but if you want to override them here's what to do:

```js
grunt.initConfig({
    deb_package: {
        options: {
            maintainer: "Paul Varache <perso@paulvarache.ninja>",
            uploaders: [ { "name": "Thomas Papiernik", "email": "thomas.papiernik@gmail.com" } ]
            version: "1.0.0",
            name: "my-package",
            short_description: "short",
            long_description: "long",
            target_architecture: "all",
            category: "devel",
            build_number: "1",
            dependencies: [],           // List of the package dependencies
            tmp_dir: '.tmp',            // The task working dir
            output: './output/'         // Where your .deb should be created
        },
        build: {
            // Here you define what you want in your package
            files: [{
                cwd: './test_files/source',
                src: '**/*',
                dest: '/opt/my-package'
            }],
            // The task will create the links as src: dest
            links: {
                '/usr/bin/mp': '/opt/my-package/bin/mp'
            },
            // You can provide preinst, postinst, prerm and postrm script either by giving a file or what to put in it
            scripts: {
                preinst: {
                    src: './test_files/preinst.sh'
                },
                postinst: {
                    content: 'echo "postinst test"'
                }
            }
        }
    }
});

```

This will create a package with the name `my-package_1.0.0-1_all.deb` taht can be installed with `sudo dpkg -i my-package_1.0.0-1_all.deb` on all debian based architectures.

### Options

#### options.maintainer
Type: `String`
Default value: `process.env.DEBFULLNAME <process.env.DEBEMAIL>` or **package.json** `author.name <author.email>`

This value defines the maintainer of the package.

#### options.uploaders
Type: `String`
Default value: **package.json** `uploaders array { name, email }`

This value defines the uploaders of the package. Take maintainers array from package.json

#### options.version
Type: `String`
Default value: **package.json** `version`

This value defines the version of the package.

#### options.name
Type: `String`
Default value: **package.json** `name`

This value defines the name of the package.

#### options.short_description
Type: `String`
Default value: First line of **package.json** `description`

This value defines the short description of the package.

#### options.short_description
Type: `String`
Default value: All line of **package.json** `description` except the first one

This value defines the long description of the package.

#### options.target_architecture
Type: `String`
Default value: `all`

This value defines the architecture of the package.

#### options.build_number
Type: `String`
Default value: `process.env.BUILD_NUMBER || process.env.DRONE_BUILD_NUMBER || process.env.TRAVIS_BUILD_NUMBER || 1`

This value defines the build number of the package.

#### options.category
Type: `String`
Default value: `misc`

The software category. Used to fill the "section" field of the control file

---------------------------------------------
There is more to do:

  * Write tests
  * generation of the .changes and .dsc files

This task was developped with the help of [Loïc Marie](https://github.com/loicmarie)
