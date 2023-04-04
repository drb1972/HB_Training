// getRepository
// Muestra info sobe el repositorio de programas en HB en CICS
// http://mstrsvw.lvn.broadcom.net:8000/hbscript/getRepository

var common = require('common', 'hbutils');
var debugging = require('debugging', 'hbutils');

debugging.global = true;

/*
 * Require the factory that has our copybooks for the VSAM file
 */
var copybookFactory = require('commAreas', 'hbutils');

/*
 * Declare global variables
 */
var cod;
var cics = new Cics();
var records = new Array();


function initialize() {
	/*
	 * Create the copybook and initialize it
	 */
	cod = new copybookFactory.repositoryRecord();
	cod.initialize();
	
	cod._getContainment = function (o, fieldName) {
		var a = this.getAttr(fieldName)
		
		if (a.parent == null) return (o);

		return (this._getContainment(o, a.parent)[fieldName]);
	}
	
	cod.toJSObj = function (excludes) {
		if (!excludes) excludes = [];
		var record = {};
		
		for (var f in this._fields) {
			if (excludes.indexOf(f) > -1) continue;
			var a = this.getAttr(f);
			
			if (a.parent == null) continue;

			var containingObject = this._getContainment(record, a.parent);
			
			if (a.type === 'group') {
				containingObject[f] = {};
			} else {
				containingObject[f] = this.get(f);
			}
		}
		
		return(record);
	}
	
}

function terminate () {
	
}

function readFile() {

	cod.set('typeOfRecord', 'S   ');
	
	var keyString = rtrim(cod.get('repositoryKey'));
	
	/*
	 * Create an object to hold the file handle
	 */
	var fileHandle = {
		generic: true,
		ridfld: keyString,
		file:'HBSCRIPT'
	}
	
	/*
	 * Execute the Start Browse on the file.  Catch any errors and deal with them.  See the
	 * CICS TS Application Programmers Reference for all of the possiable response codes
	 */
	try {
		cics.exec.startBrowseFile(fileHandle);
	} catch(e if e.resp == 13) {  
		
		/*
		 * An attempt to position on a record based on the search argument provided is unsuccessful.
		 */ 
		writeln('Key does not match any records');
		exit();
	} catch(e if e.resp == 12) {  
		
		/*
		 * A file name referred to in the FILE option cannot be found in the FCT and SYSID has not been specified
		 */
		writeln('File not found');
		exit();
	} catch(e) {
		
		/*
		 * If we don't know what error occured then dump the messages and get out
		 */
		for (var p in e) writeln(p, ' = ', e[p]);
		exit();
	}
	
	/*
	 * Read up to 1000 records
	 */
	for (var recCount=0; recCount<1000; recCount++) {
		
		/*
		 * Read the record, handle expected errors
		 */
		try {
			cics.exec.readNextFile(fileHandle);
		} catch (e if e.resp == 20) {  
			/*
			 * End of File
			 */
//			writeln('\n\nEOF');
			break;
		} catch (e) {
			/*
			 * Unknown error, dump messages and get out
			 */
			for (var p in e) writeln(p, ' = ', e[p]);
			exit();
		}
		
		/*
		 * If the record does not the generic key then get out
		 */
		if (fileHandle.ridfld.substring(0, keyString.length) != keyString) {
//			writeln('Record read does not match key\nEnd of Data\n');
			break;
		}
		
		/*
		 * Put the record into the copy book object so we can access the individual fields
		 */
		cod.set('repositoryRecord', fileHandle.into);
		
		if (cod.get('recordSequence') != 0) continue;
		
		records.push(cod.toJSObj(['anByte', 'creatorTimeStampX', 'updaterTimeStampX', 'metaDataType', 'metaDataReserved', 'eyecatcher']));
		
		//records.push(copybookToJSObj(cod, ['anByte', 'creatorTimeStampX', 'updaterTimeStampX', 'metaDataType', 'metaDataReserved', 'eyecatcher']));
	}
	
	
}

function main() {
	initialize();
	
	readFile();
	
	writeln(common.toJSONString(records));
	
//	writeln('typeOfRecord = ', cod.get('typeOfRecord'));
//	writeln('typeOfRecord Exist = ', cod.exist('typeOfRecord'));
//	writeln('bob Exist = ', cod.exist('bob'));
	
//	writeln(debugging.object(records,'records'));
	
	terminate();	
}

try {
	main();
} catch(e) {
	debugging.global = true;
	debugging.writeObj(e,'Error Object');
	writeln("Ended in error, check the debugging TS queue");
}