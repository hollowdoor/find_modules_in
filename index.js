var fsp = require('fs-promise'),
    path = require('path');

/*
git remote add origin https://github.com/hollowdoor/find_modules_in.git
git push -u origin master
*/

function findModules(directory, indexes){

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

    return fsp.exists(directory).then(function(exists){

        if(!exists){
            throw new Error('directory '+directory+' does not exist.');
        }

        return readdir(directory).then(function(files){

            return findFolders(files).then(function(folders){
                return findPackages(folders, indexes);
            });
        });
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

function findPackages(list, indexes){
    var packs;
    var packsPromise = Promise.all(list.map(function(file){
        return loadPackageJSON(file);
    }));

    var found = packsPromise.then(function(packList){

        packs = packList;
        return list.map(function(file, index){

            if(packs[index]){
                return true;
            }

            return !includeIndexed ? false : indexExists(file, indexes);
        });
    });

    return found.then(function(found){

        return list.map(function(file, index){

            var indexFile = null;
            if(typeof found[index] === 'string'){
                indexFile = found[index];
            }
            return {
                directory: file,
                package: packs[index],
                index: indexFile
            };
        }).filter(function(file, index){
            return found[index];
        });
    });
}

function indexExists(dir, indexes){
    return Promise.all(indexes.map(function(index){
        return fsp.exists(path.join(dir, index));
    })).then(function(existing){

        for(var i=0; i<existing.length; i++){
            if(existing[i]){
                return path.join(dir, index);
            }
        }
        return null;
    });
}


function loadPackageJSON(dir){
    return fsp.exists(path.join(dir, 'package.json')).then(function(exists){

        if(!exists){
            return null;
        }

        return fsp.readFile(path.join(dir, 'package.json'), 'utf8').then(function(pack){
            return JSON.parse(pack);
        });
    });
}


module.exports = findModules;
