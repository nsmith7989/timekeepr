var fs = require('fs');
var timeObj = readFile();

for (var site in timeObj) {
	console.log(site);
	var site = timeObj[site];
	//convert to hours
	var hoursSpent = site.timeSpent / 60;

	console.log(hoursSpent);

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