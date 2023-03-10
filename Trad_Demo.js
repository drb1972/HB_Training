var startTime = HB.stckf();

var hb = new HB.Session();
var common = require('common', 'hbutils');
var debugging = require('debugging', 'hbutils');

common.hbRunProto();

debugging.checkDebugControl();
debugging.global = true;

var response = {
		quotes: [],
		status: {
			elapsedTime: 0,
			tranCount: 0,
			success: false,
			errors: []
		}
}

function initialize() {
	
	var input = {
		companies: HB.request.http.getValue('companies').split(','),
		type: HB.request.http.getValue('type') !== 'xml' ? 'JSON' : 'XML'
	} 
	
	hb.set('hb_entry', 'trad');
	hb.run('HB_AID=ENTER', 'T002');
	
	return(input);
}

function termination() {
	hb.run('HB_AID=PF12&hb_delete_session=1');
	response.status.elapsedTime = HB.stckf() - startTime;
	response.status.tranCount = hb.tranCount;
	common.headers.json();
	writeln(common.toJSONString(response));
} 

function getQuote(companyNumber) {
	hb.set('OPTION', companyNumber);
	hb.run('HB_AID=ENTER', 'T003');

	hb.set('OPT2', '1');
	hb.run('HB_AID=ENTER', 'T004');
	
	var quote = {
		companyName: hb.getFieldValue('COMP41'),
		shares: hb.getFieldValue('HELD'),
		totalValue: hb.getFieldValue('VALUE'),
		sharePrice: hb.getFieldValue('SHRNOW')
	}

	hb.run('HB_AID=PF3', 'T003');
	hb.run('HB_AID=PF3', 'T002');	
	
	return(quote);
}

function main() {
	try {
		var input = initialize();
		for (var i=0; i < input.companies.length; i++) {
			response.quotes.push(getQuote(input.companies[i]));
		}
		response.status.success = true;
	} catch (e) {
		response.status.errors.push(e);
	} finally {
		termination();
	}
}

main();
