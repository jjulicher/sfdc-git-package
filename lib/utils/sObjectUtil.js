let fs = require('fs'),
    xml2js = require('xml2js');

module.exports = function (config) {

    this.createJSONForFiles = function (files) {
        let parser = xml2js.Parser();
        files.forEach(file => {
            fs.readFile(file, function (err, data) {
                parser.parseString(data, function (err, result) {
                    fs.writeFile(file + '.json', JSON.stringify(result, null, 2));
                });
            });
        })
    }

    this.getFieldsForSobject = function (SObject) {
        return new Promise(function (resolve, reject) {
            fs.readFile(file, function (err, data) {
                let sobjectJSON = JSON.parse(data);
                resolve(sobjectJSON.fields);
            });
        });
    }
};