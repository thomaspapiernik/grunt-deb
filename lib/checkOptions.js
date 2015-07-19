module.exports = function isValid(grunt, options) {
    var valid = true;
    if (!options.maintainer) {
        grunt.log.subhead('No maintainer details provided!!');
        grunt.log.errorlns('Please add the \'maintainer\' option specifying the name and email in your deb_package configuration in your Gruntfile.js or add \'DEBFULLNAME\' and \'DEBEMAIL\' environment variable (i.e. export DEBFULLNAME="James D Bloom" && export DEBEMAIL="jamesdbloom@email.com")');
        valid = false;
    }
    if (!options.short_description) {
        grunt.log.subhead('No short description provided!!');
        grunt.log.errorlns('Please add the \'short_description\' option in your debian_package configuration in your Gruntfile.js or add a \'description\' field to package.json');
        valid = false;
    }
    if (!options.long_description) {
        grunt.log.subhead('No long description provided!!');
        grunt.log.warn('Please add the \'long_description\' option in your debian_package configuration in your Gruntfile.js or add a multi line \'description\' field to package.json (note: the first line is used as the short description and the remaining lines are used as the long description)');
    }
    return valid;
};
