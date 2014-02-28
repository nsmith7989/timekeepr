#!/usr/bin/env node

console.log(process.argv);

var watch = require('watch');
var fs = require('fs');
var growl = require('growl');

var tempFile = '/Users/nathanaelsmith/timekeepr/timesaver.json';

var directoryObj = loadTimesaver() || {};

watchSuperDirectory('/Users/nathanaelsmith/PhpstormProjects');
var count = directoryObj.count || 0;


var excluded = /.idea/g;
var excluded2 = /.git/g;

function loadTimesaver() {

	try {
		var data = fs.readFileSync(tempFile);
	} catch (e) {
		return false;
	}
	try {
		parsedData = JSON.parse(data);
		if (parsedData.currentDay === (new Date()).getDay()) {
			return parsedData
		} else {
			return false;
		}
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

	//read the day logged, if it's not the current day, overwrite the directory object
	if (directoryObj.currentDay !== (new Date()).getDay()) {
		console.log('  >>>>  Old data, delete');
		//write out old object to file
		var tempParts = tempFile.split('.');
		fs.writeFileSync( ( tempParts[0] + (new Date()).getDay() + '.json' ) , JSON.stringify(directoryObj));

		directoryObj = {};
	}

	console.log('File changed: ' + f);

	directoryObj.currentDay = (new Date()).getDay();

	if ( directoryObj[site] === undefined){
		directoryObj[site] = {};
	}
	var currentObj = directoryObj[site];


	count = currentObj.count || 0;

	//read and write every other
	if (count % 2 === 0) {
    	pastTime = currentObj.mtimeOdd;
    	currentObj.mtimeEven = new Date();
  	} else {
    	pastTime = currentObj.mtimeEven;
    	currentObj.mtimeOdd = new Date();
  	}

	pastTime = new Date(pastTime);

	difference = ((new Date()) - pastTime) / 60000;

	if (!currentObj.count) {
		currentObj.count = 0;
	}

	currentObj.count++;

	addTototal(currentObj, difference, site);

}

function addTototal(currentObj, difference, site) {
	if (currentObj.timeSpent === undefined) {
		currentObj.timeSpent = 0;
	}
	if (difference < 10) {
		console.log('Change made within interval. Time will be saved');
		currentObj.timeSpent += difference;
		console.log('Total time spent ' + currentObj.timeSpent);

		fs.writeFile(tempFile, JSON.stringify(directoryObj), function(err) {
			if (err) throw err;
			console.info('Writing out');
			console.log('===================');
		});

	} else {
		console.log('You haven\'t been working here for a while');
		growl('You haven\'t been working in ' + site + ' time not saved', { image: 'article.pdf' });
		return;
	}
}
