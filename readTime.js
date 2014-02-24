var fs = require('fs');

var timeObj = readFile();

for (var site in timeObj) {
	
	var item = timeObj[site];
	//convert to hours
	var hoursSpent = item.timeSpent / 60,
		roundedHours = Math.round(hoursSpent * 100) / 100

	if (roundedHours !== 0) {
		console.log('==========\n' + site + ' : ' + roundedHours + '\n==========');
	}

}

function readFile() {
	try { 
		var data = fs.readFileSync('/tmp/timesaver.json');
		return JSON.parse(data);
	} catch (e) {
		console.log(e);
		process.exit(1);
	}
}