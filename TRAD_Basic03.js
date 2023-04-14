// TRAD Basic03
// En initialize acepto las variables de compañías y type (xml o json)
// Copy into Eclipse as an TRAD_Basic03.hbx file
// http://mstrsvw.lvn.broadcom.net:8000/hbscript/TRAD_Basic03

var hb = new HB.Session();
var common = require('common', 'hbutils');
var debugging = require('debugging', 'hbutils');
common.hbRunProto();
debugging.checkDebugControl();
debugging.global = true;

var response = {
	quotes: []
	}

function initialize() {
   var input = {
      companies: HB.request.http.getValue('companies').split(','),
      type: HB.request.http.getValue('type') 
   }
   
	hb.set('hb_entry', 'trad');
	hb.run('hb_aid=ENTER', 'T002');

   return(input);
}

function getQuote(companyNumber) {
	hb.set('OPTION', companyNumber);

	hb.run('hb_aid=ENTER', 'T003');
	
	hb.set('OPT2', '1');
	hb.run('hb_aid=ENTER', 'T004');
	
	var quote = {
			companyName: hb.getFieldValue('COMP41'),
			shares: hb.getFieldValue('HELD'),
			totalValue: hb.getFieldValue('VALUE'),
			sharePrice: hb.getFieldValue('SHRNOW')
		}

	hb.run('hb_aid=PF3', 'T003');
	hb.run('hb_aid=PF3', 'T002');

   return(quote);
}

function termination() {
	hb.run('hb_aid=PF12&hb_delete_session=1');

   // var type = HB.request.http.getValue('type');

   // if (type=="xml"){
   //    common.headers.xml();
   //    writeln(common.jsToXML(response,"StockQuote"));		  
   // }
   // else{
   //    common.headers.json();
   //    writeln(common.toJSONString(response));
      
   // }

   common.headers.json();
   writeln(common.toJSONString(response));
} 

function main() {

   var input = initialize();
   for (var i=0; i < input.companies.length; i++) {
      response.quotes.push(getQuote(input.companies[i]));
   }
   termination();
}

main();

