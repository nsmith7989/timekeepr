var fs = require('fs');

var timeObj = readFile();

for (var site in timeObj) {
	
	var item = timeObj[site];
	//convert to hours
	var hoursSpent = item.timeSpent / 60,
		roundedHours = Math.round(hoursSpent * 100) / 100;

	if (roundedHours !== 0 && roundedHours) {
		console.log('==========\n' + site + ': ' + roundedHours + ' hours\n==========\n\n');
	}

}


function readFile() {
	try { 
		var data = fs.readFileSync('/Users/nathanaelsmith/timekeepr/timesaver.json');
		return JSON.parse(data);
	} catch (e) {
		console.log(e);
		process.exit(1);
	}
}
