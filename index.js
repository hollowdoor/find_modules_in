var fsp = require('fs-promise'),
    path = require('path');

/*
git remote add origin https://github.com/hollowdoor/find_modules_in.git
git push -u origin master
*/

function findModules(directory, indexes, showStack){

    showStack = showStack || false;

    if(Object.prototype.toString.call(indexes) !== '[object Array]'){
        if(typeof indexes === 'boolean'){

            if(indexes){
                indexes = ['index.js', 'index.node'];
            }else{
                indexes = [];
            }
        }else{
            indexes = [];
        }
    }

    indexes = indexes.filter(function(index){
        return typeof index === 'string';
    });

    return readdir(directory).then(function(files){
        if(!files.length) return [];
        return findFolders(files).then(function(folders){
            return findPackages(folders, indexes, showStack).catch(function(e){
                throw new Error('Something happend when look for packages: '+
                createErrorString(e, showStack));
            });
        }).catch(function(e){
            throw new Error('Something happened when looking for modules: '+
            createErrorString(e, showStack));
        });
    }).catch(function(e){
        throw new Error('Directory '+directory+' is not available with this error '+
        createErrorString(e, showStack));
    });
}


function readdir(dir){
    return fsp.readdir(dir).then(function(files){

        return files.map(function(file){
            return path.join(dir, file);
        });
    });
}

function findFolders(files){
    var pstats = Promise.all(files.map(function(file){
        return fsp.stat(file);
    }));

    return pstats.then(function(stats){

        return files.filter(function(f, i){
            return stats[i].isDirectory();
        });
    });
}

function findPackages(folders, indexes, showStack){

    var resolveModules = Promise.all(folders.map(function(file){
        return loadPackageJSON(file, showStack);
    })).then(function(packages){

        return packages.map(function(package, index){

            if(!package){
                return false;
            }

            return {
                package: package,
                directory: folders[index],
                index: package.main || package.index || null,
                main: package.main || package.index || null
            };
        });
    }).then(function(modules){
        return modules.map(function(module, i){
            if(module){
                return module;
            }

            return indexExists(file, indexes).then(function(main){
                if(!main) return false;
                return {
                    package: null,
                    directory: folders[index],
                    index: main,
                    main: main
                };
            });
        });
    });

    return resolveModules.then(function(modules){

        return modules.filter(function(module){
            return module;
        }).map(function(module){
            if(module.package){
                module.packageError = module.package.error || null;
                if(module.packageError){
                    module.package = null;
                }
            }

            return module;
        });
    });
}

function indexExists(dir, indexes){
    return Promise.all(indexes.map(function(indexFile){
        indexFile = path.join(dir, indexFile);
        return fsp.stat(indexFile).then(function(){
            return indexFile;
        }).catch(function(e){
            return false;
        });
    })).then(function(maybe){
        maybe = maybe.filter(function(item){
            return item;
        });
        return maybe.length ? path.join(dir, maybe[0]) : false;
    });
}


function loadPackageJSON(dir, showStack){
    return fsp.readFile(path.join(dir, 'package.json'), 'utf8').then(function(packString){
        if(empty(packString)){
            return {};
        }

        try{
            return JSON.parse(packString);
        }catch(e){
            return {error: "package.json was found but could not be parsed with error: \n"+
            createErrorString(e, showStack)};
        }

    }).catch(function(error){
        return Promise.resolve(false);
    });

    /*.then(function(package){
        if(package && typeof package.readme === 'string'){
            console.log(package.readme.length);
            if(package.readme.length > 140){
                package.readme = package.readme.slice(0, 140);
            }
        }

        return package;
    });*/

}

function createErrorString(e, showStack){
    return e.name || '' + showStack ? e.message + e.stack || '' : '';
}

function empty(pack){
    return pack.length < 2;
}


module.exports = findModules;
