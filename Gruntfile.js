module.exports = function (grunt) {

    grunt.initConfig({
        deb_package: {
            options: {
                maintainer: "Paul Varache <perso@paulvarache.ninja>",
                version: "1.0.0",
                name: "my-package",
                short_description: "short",
                long_description: "long",
                target_architecture: "all",
                category: "devel",
                build_number: "1",
                dependencies: ['nginx'],
                output: './output/'
            },
            build: {
                files: [{
                    cwd: './test_files/source',
                    src: '**/*',
                    dest: '/opt/my-package'
                }],
                links: {
                    '/usr/bin/mp': '/opt/my-package/bin/mp'
                },
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

    grunt.loadTasks('./tasks');

    grunt.registerTask('default', ['deb_package']);
};
