var startTime = HB.stckf();

var common = require("common", "hbutils");
var debugging = require("debugging", "hbutils");

common.hbRunProto();
//debugging.checkDebugControl();
//debuggin.global = true;

var hb = new HB.Session();

var response = {
		status : {
			timestamp: 0,
			tranCount: 0,
			platform: '',
			elapsedTime: 0,
			success: false,
			errors: []
		},
		accountList: [{
			accountNumber: 0,
			customer: {
				name: {
					first: "",
					middle: "",
					last: ""
				},
				address: {
					street: "",
					city: "",
					zip: ""
				},
				phone: ""
			}
		}]
}

function initialize(){
	hb.run('hb_tranid=trad', 'SLICKM0');

}

function terminate() {
	hb.run("hb_aid=pf3");
}

function main() {
	
	
}

main()
