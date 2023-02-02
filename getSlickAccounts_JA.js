var startTime = HB.stckf();
var hb = new HB.Session();
var cics = new Cics();

var common = require('common', 'hbutils');
var debugging = require('debugging', 'hbutils');

var CBF = require('slickAcctCBjs', 'hbscript');

var slckAcct;

debugging.checkDebugControl();
common.hbRunProto();

var response = {
		status : {
			platform: '',
			tranCount: 0,
			timestamp: '',
			elapsedTime: 0,
			success: false,
			errors: []
		},
		accountList: []
}

function initialize(){
	hb.run('hb_tranid=slk0', 'SLICKM0');
	
	slckAcct = new CBF.account();
	
	slckAcct.initialize(' ');
	
	response.status.platform = 'CICS - ' + cics.sysid;
	response.status.timestamp = new Date().toLocaleString();
}

function terminate() {
	hb.run('hb_aid=pf12&hb_delete_session=1');
	
	response.status.tranCount = hb.tranCount;
	response.status.elapsedTime = HB.stckf() - startTime;
	
	common.headers.json();
	writeln(common.toJSONString(response));
}

function getAllAccount() {
	
	for (let i = 6; i < 19; i+=4) {
		let record = hb.getText(i, 1, 240);
		
		slckAcct.set('account', record);
		
		if (trim(slckAcct.get('accountNum')) == '') {
			continue;
		}
		
		response.accountList.push({
			accountNumber : slckAcct.get('accountNum'),
			customer : {
				name : {
					lastName :  slckAcct.get('last').trim(),
					middleName : slckAcct.get('mid').trim(),
					firstName : slckAcct.get('first').trim()
				},
				address : {
					street: slckAcct.get('street').trim(),
					city: slckAcct.get('city').trim(),
				    state: slckAcct.get('state').trim(),
				    zip: slckAcct.get('zip').trim()
				},
				phoneNumber : slckAcct.get('phone').trim()
			}
		})
	}
}

function main() {
	try {
		let input = initialize();
		
		hb.run('hb_aid=pf2');		
		
		for (let page = 1; page < 1000; page++) {
			
			getAllAccount();
			
			if (hb.getFieldValue('M2OF') == hb.getFieldValue('M2TO')) {
				break;
			}
			
			hb.run('hb_aid=pf8');
		}
		
		response.status.accountsReturned = response.accountList.length;
		response.status.success = true;
	} catch (e) {
		response.status.errors.push(e);
	} finally {
		terminate();
	}
}

main();
