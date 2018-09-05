const fs = require('fs');
const path = require('path');

module.exports = function (config, package) {
    let walkSync = dir =>
        fs.lstatSync(dir).isDirectory()
            ? fs.readdirSync(dir).map(f => walkSync(path.join(dir, f)))
            : dir;

    const flatten = arr => arr.reduce(
        (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
    );

    this.cleanUpRepo = () => {
        let files = walkSync(config.repo + '/src');
        files = flatten(files);
        let flattenPackage = package;
        console.log(package);
        files.forEach(file => {
            let filePath = path.parse(file);

            let name = filePath.base;
            let found = false;

            if(filePath.base.indexOf('-meta.xml') >= 0){
                name = filePath.base.replace('-meta.xml', '');
            }


            for (let i = flattenPackage.length - 1; i >= 0; --i) {
                const diffFile = flattenPackage[i];
                if (!diffFile.startsWith('d')
                    && diffFile.indexOf('~') === -1
                    && diffFile.indexOf(name) !== -1) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                console.log('Not Found: ' + filePath.dir + '/' + filePath.base);
                fs.unlinkSync(file);
            }
            else {
                console.log('Found: ' + filePath.dir + '/' + filePath.base);
            }
        });
    }
}