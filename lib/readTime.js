module.exports = (function() {
	var fs = require('fs');
	var config = require('./config');
	var moment = require('moment');
	var path = require('path');

	var arguments = process.argv.slice(2);


	if (arguments[1]) {
		var regex = /[^a-zA-Z]+[\-]+/g

		if (regex.test(arguments[1])) {
			dateObj = processDate(arguments[1]);
		} else {
			dateObj = processDate(arguments[1], 1);
		}
		

		var tempFile = path.dirname(__dirname) + '/backups/timesaver-' + dateObj.fileDate + '.json';

		console.log('Time for ' +  dateObj.fileDate);

		if (fs.existsSync(tempFile)) {
   			var timeObj = readFile(tempFile);
		} else {
			console.log('File ' + tempFile + ' does not exist');
		}

	} else {
		var dateObj = processDate(new Date());

		var tempFile = path.dirname(__dirname) + '/backups/timesaver-' + dateObj.fileDate + '.json';
		var timeObj = readFile(tempFile);

	}
		
	
	for (var site in timeObj) {

		var item = timeObj[site];
		//convert to hours
		var hoursSpent = item.timeSpent / 60,
			roundedHours = Math.round(hoursSpent * 100) / 100;

		if (roundedHours !== 0 && roundedHours) {
			console.log('==========\n' + site + ': ' + roundedHours + ' hours\n==========\n');
		}

	}


	function readFile(tempFile) {
		try {
			var data = fs.readFileSync(tempFile);
			return JSON.parse(data);
		} catch (e) {
			if (e.errno == 34) {
				console.log('File %s not found', tempFile);
			}
			process.exit(1);
		}
	}

	function processDate(date, argYesterday) {
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

			if (argYesterday) {

				mDate = moment().subtract('day', 1);

			}

			fileDate = mDate.format('YYYY') + '-' + mDate.format('MM') + '-' + mDate.format('DD');


		return {
			raw: rawDateStr,
			mDate: mDate,
			fileDate: fileDate
		}

	}
})();