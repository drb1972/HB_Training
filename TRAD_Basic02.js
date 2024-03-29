// TRAD Basic02
// Incluye opciones de debug, utilities (p.e. nombre de pantalla)
// Código agrupado en funciones
// Creamos un objeto para almacenar los valores
// En main almacenamos el objeto
// Copy into Eclipse as an TRAD_Basic02.hbx file
// http://mstrsvw.lvn.broadcom.net:8000/hbscript/TRAD_Basic02

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
	hb.set('hb_entry', 'trad');
	hb.run('hb_aid=ENTER', 'T002');
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
   common.headers.json();
	writeln(common.toJSONString(response));
} 

function main() {
	initialize();
	response.quotes.push(getQuote('1'));
	termination();
}

main();

