var spawn = require('child_process').spawn,
    fs = require('fs');

describe('deb_package', function () {
    it('should generate a .deb', function (done) {
        var g = spawn('grunt');
        g.on('exit', function (code) {
            if (code !== 0) {
                return done(new Error('The grunt task exited with code' + code));
            }
            fs.exists('./output/my-package_1.0.0-1_all.deb', function (exists) {
                if (!exists) return done(new Error('.deb file was not generated'));
                done();
            });
        });
    });
});
