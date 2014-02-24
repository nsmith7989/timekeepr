var watch = require('watch');
var fs = require('fs');
var directoryObj = loadTimesaver() || {};
watchSuperDirectory('/Users/nathanaelsmith/PhpstormProjects');
var count = 0;

var excluded = /.idea/g;
var excluded2 = /.git/g;

function loadTimesaver() {

	try {
		var data = fs.readFileSync('/tmp/timesaver.json');
	} catch (e) {
		return false;
	}
	try {
		parsedData = JSON.parse(data);
		return parsedData;
	} catch(e) {
		return false;
	}

}


function watchSuperDirectory(dir) { 
	watch.watchTree(dir, function (f, curr, prev) {
		if (typeof f === 'object' && curr === null && prev === null) {
			console.log('Listening on ' + dir);
		} else if (excluded.test(f) || excluded2.test(f)) {
			return;
		} else if (prev === null) {
			//we added a new file
		} else {
			handleTimePassed(f, curr, prev);
		}

	});

}

function handleTimePassed(f, curr, prev) {
	var site =  f.split('/')[4];
	console.log('You\'re currently in ' + site);

	console.log('File changed: ' + f);

	if ( directoryObj[site] === undefined){
		directoryObj[site] = {};
	}
	var currentObj = directoryObj[site];


	count = currentObj.count || 0;

	pastCountKey = count - 1;

	pastTime = currentObj['mtime' + pastCountKey];

	pastTime = new Date(pastTime);

	currentObj['mtime' + count] = new Date();

	difference = ((new Date()) - pastTime) / 60000;

	if (!currentObj.count) {
		currentObj.count = 0;
	}

	currentObj.count++;

	addTototal(currentObj, difference);

}

function addTototal(currentObj, difference) {
	if (currentObj.timeSpent === undefined) {
		currentObj.timeSpent = 0;
	}
	if (difference < 10) {
		console.log('Change made within interval. Time will be saved');
		currentObj.timeSpent += difference;
		console.log('Total time spent ' + currentObj.timeSpent);

		fs.writeFile('/tmp/timesaver.json', JSON.stringify(directoryObj), function(err) {
			if (err) throw err;
			console.info('Writing out');
			console.log('===================');
		});

	} else {
		console.log('You haven\'t been working here for a while');
		return;
	}
}