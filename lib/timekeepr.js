#!/usr/bin/env node

var arguments = process.argv.slice(2);


if (arguments[0] == '--read') {
	var timeReader = require('./readTime.js');
	process.exit();
}


var watch = require('watch');
var fs = require('fs');
var growl = require('growl');
var config = require('./config');
var humanize = require('humanize');
var moment = require('moment');
var path = require('path');
var _ = require('lodash');

process.chdir(__dirname);
process.chdir('../');
var currentDay = processDate(new Date());

var tempFile =  path.dirname(__dirname) + '/backups/timesaver-' + currentDay.fileDate + '.json';

console.log(tempFile);

var directoryObj = loadTimesaver() || {};

config.watchDirs.forEach(function(dir) {
	watchSuperDirectory(dir);
});

var count = directoryObj.count || 0;

var excluded = /\.idea/g;
var excluded2 = /\.git/g;

function processDate(date) {
	//check if date is a date object or string
	if (date instanceof Date) {
		strDate = (date.getMonth() + 1) + '-' + date.getDate() + '_' + date.getFullYear();

	} else {
		strDate = '' + date;
	}

	var dateParts = strDate.split(/\W/g),
		year = dateParts[2] || (new Date().getFullYear().toString());

		rawDateStr = dateParts[0] + '-' + dateParts[1] + '-' + year,

		mDate = moment(rawDateStr, ['MM-DD-YY','MM-DD-YYYY']);


		fileDate = mDate.format('YYYY') + '-' + mDate.format('MM') + '-' + mDate.format('DD');


	return {
		raw: rawDateStr,
		mDate: mDate,
		fileDate: fileDate
	}

}

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
	var dirParts = dir.split('/');
	watch.watchTree(dir, function (f, curr, prev) {
		if (typeof f === 'object' && curr === null && prev === null) {
			console.log('Listening on ' + dir);
		} else if (excluded.test(f) || excluded2.test(f)) {
			return;
		} else if (prev === null) {
			//we added a new file
		} else {
			handleTimePassed(f, curr, prev, dirParts);
		}

	});

}

function handleTimePassed(f, curr, prev, dirParts) {
	var site =  f.split('/')[dirParts.length];
	console.log('You\'re currently in ' + site);

	//read the day logged, if it's not the current day, overwrite the directory object
	if (directoryObj.currentDay !== (new Date()).getDay()) {
		console.log('  >>>>  Old data, delete');
		//write out old object to file
		var tempParts = tempFile.split('.');
		fs.writeFileSync( ( tempParts[0] + '-' + humanize.date('Y-m-d') + '.json' ) , JSON.stringify(directoryObj));

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

	debouceAdd = _.debounce(addTototal, 3000);

	debouceAdd(currentObj, difference, site);

}

function addTototal(currentObj, difference, site) {
	if (currentObj.timeSpent === undefined) {
		currentObj.timeSpent = 0;
	}
	if (difference < 10) {
		console.log('Change made within interval. Time will be saved');
		currentObj.timeSpent += difference;
		console.log('Total time spent ' + currentObj.timeSpent);

		currentDay = processDate(new Date());

		tempFile =  path.dirname(__dirname) + '/backups/timesaver-' + currentDay.fileDate + '.json';


		fs.writeFile(tempFile, JSON.stringify(directoryObj), function(err) {
			if (err) throw err;
			console.info('Writing out');
			console.log('===================');
		});

	} else {
		console.log('You haven\'t been working here for a while');
		growl('You haven\'t been working in ' + site + ' time not saved');
		return;
	}
}
