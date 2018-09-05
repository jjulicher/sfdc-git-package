const child_process = require('child_process');
const cleanUpRepo = require('./cleanUpRepo');

module.exports = function (config) {

    this.diff = function () {
        return new Promise(function (resolve, reject) {
                let fullResult = '';
                if (!config.from) {
                    const firstCommitSHARaw = child_process.spawnSync('git', ['rev-list', '--max-parents=0', 'HEAD'], {
                        "cwd": config.repo
                    }).stdout;
                    const firstCommitSHA = Buffer.from(firstCommitSHARaw);
                    config.from = firstCommitSHA.toString('utf8').trim();
                }

                const child = child_process.spawn("git", ["diff", "--name-status", "--diff-filter=ADM", config.from, config.to], {
                    "cwd": config.repo
                });

                child.stdout.on('data', function (data) {
                    let buff = Buffer.from(data);
                    fullResult += buff.toString('utf8');
                });
                child.on('close', function (code) {
                    const diffs = {
                            'package.xml': {},
                            'destructiveChangesPre.xml': {}
                        },

                        lines = fullResult
                            .split('\n')
                            .filter(e => {
                                return  e.indexOf('settings') === -1
                                    && !e.startsWith('D')
                                    && e.indexOf('~') === -1

                                    && !e.endsWith('.label')
                                    && !e.endsWith('.layout')
                                    && (!e.endsWith('.workflow') || (!config.package || config.package.length === 0) )
                                    && (!e.endsWith('.object') || (!config.package || config.package.length === 0))
                                    || (e.endsWith('__e.object'));
                            }),
                        sobjects = fullResult.split('\n')
                            .filter(e => {
                                return e.endsWith('.object');
                            });

                    lines.forEach(function (line) {

                        let context = null;
                        if (line.indexOf('D') !== 0) {
                            context = diffs['package.xml'];
                        } else {
                            context = diffs['destructiveChangesPre.xml'];
                        }
                        let explodedLine = line.replace('-meta.xml', '').split('/');
                        if (explodedLine[0].indexOf('src') !== -1) {

                            if (context[explodedLine[1]] === undefined) {
                                context[explodedLine[1]] = [];
                            }
                            let elementName = explodedLine.slice(2).join('/').split('.').slice(0, -1).join('.');
                            if (explodedLine[1] === 'aura') {
                                elementName = explodedLine[2];
                            }
                            if (context[explodedLine[1]].indexOf(elementName) === -1) {
                                context[explodedLine[1]].push(elementName);
                            }
                        }
                    });

                    sobjects.forEach(fileName => {

                    });
                    // TODO handle Custom Object Contents (fields, fieldsets, weblink), workflows and Custom Labels remove
                    console.log('lines: ');
                    console.log(lines);

                    const cur = new cleanUpRepo(config, lines);
                    cur.cleanUpRepo();

                    resolve(diffs);
                });
                child.stderr.on("data", function (data) {
                    const buff = new Buffer(data);
                    reject(buff.toString('utf8'));
                });
            }
        );
    };
};