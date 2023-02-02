// select region - put s cicssvwa - type enter
// exit
// clear screen
// enter slk0

// url for debugger
// http://mstrsvw.lvn.broadcom.net:8000/hbutils/DebugControl.html

var startTime = HB.stckf();

var common = require('common', 'hbutils');
var debugging = require('debugging', 'hbutils');

var response = {
		   status : {
		      platform: '',
		      tranCount: 0,
		      timestamp: '',
		      elapsedTime: 0,
		      success: false,
		      errors: []
		   },
		   accountList: [{
		      accountNumber : 0,
		      customer : {
		         name : {
		            lastName :  null,
		            middleName : null,
		            firstName : null
		         },
		         address : {
		            street : null,
		            city   : null,
		            state  : null,
		            zip    : 0
		         },
		         phoneNumber : null
		      }
		   }]
		}
common.hbRunProto();
debugging.checkDebugControl();
debugging.global = true;

var hb = new HB.Session();



function printCurrentScreen() {

	print('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n');

	// use this to find the keys in hb session obj
	//for (let key in hb) {
	//	print(key)
	//}
	var aDocString = hb['xmlDoc']
	//print(aDocString)
	//print(typeof(aDocString))
	
	// Convert to XML
	var xmlThing = new XML(aDocString);
	//print(xmlThing)

	// Extract the screen
	var aScreen = xmlThing.transaction.screen[0]
	writeln(aScreen)
	print('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n');
	
}

function appendAccount() {
	response.accountList.push(  { 
      accountNumber : 0,       
      customer : {             
         name : {              
            lastName :  null,  
            middleName : null, 
            firstName : null   
         },                    
         address : {           
            street : null,     
            city   : null,     
            state  : null,     
            zip    : 0         
         },                    
         phoneNumber : null    
      }                        
   })  
	
}

function getNameData(fieldName,i) {
	
	print('=-=-=-=-=-=-=-=-=-=\n');
	
	// This grabs all but the last letter since it doesn't end in a space
	var rowList1 = hb.getFieldValue(fieldName).match(/[A-Za-z0-9]+ /g)
	//print(rowList1[0])
	//print(rowList1[1])
	//print(rowList1[2])

	var theNumber = rowList1[0]
	var lastName = rowList1[1]
	var firstName = rowList1[2]
	// This grabs the final initial
	var middleInitial = hb.getFieldValue(fieldName).match(/[A-Z]$/) 

	writeln("the number     : ", theNumber)
	writeln("first name     : ", firstName)
	writeln("middle initial : ", middleInitial)
	writeln("last name      : ", lastName)

	response.accountList[i].accountNumber = theNumber;
	response.accountList[i].customer.name.lastName = lastName;
	response.accountList[i].customer.name.middleName = middleInitial;
	response.accountList[i].customer.name.firstName = firstName;

}


function getStreetData(fieldName,i) {
	
	//print('=-=-=-=-=-=-=-=-=-=\n');
	
	var streetAddr = hb.getFieldValue(fieldName).trim()
	writeln("street Addr    : ", streetAddr)
	response.accountList[i].customer.address.street = streetAddr;

	
}

function getCityStateZipPhoneData(fieldName,i) {
	
	//print('=-=-=-=-=-=-=-=-=-=\n');
	
	// This grabs all but the last letter since it doesn't end in a space
	var rowList = hb.getFieldValue(fieldName).match(/[A-Za-z0-9]+ /g)
	//print(rowList[0])
	//print(rowList[1])
	//print(rowList[2])

	var theCity = rowList[0]
	var theState = rowList[1]
	var theZip = rowList[2]
	// This grabs the final phone number
	var areaCode = hb.getFieldValue(fieldName).match(/\([0-9]+\)/) 
	var localNumber = hb.getFieldValue(fieldName).match(/[0-9]+\-[0-9]+/) 

	writeln("city           : ", theCity)
	writeln("state          : ", theState)
	writeln("zip            : ", theZip)
	writeln("phone number   : ", areaCode, ' ', localNumber)

	response.accountList[i].customer.address.city = theCity;
	response.accountList[i].customer.address.state = theState;
	response.accountList[i].customer.address.zip = theZip;
	response.accountList[i].customer.phoneNumber = areaCode + ' ' + localNumber;

	
}




function initialize() {
	hb.run('hb_tranid=slk0&hb_show_screen=1&hb_show_literals=1');
	printCurrentScreen()
	
}

function terminate () {
	
	hb.endSession();
	//hb.set('hb_delete_session', '1');
	//hb.run('hb_aid=pf12');
	
	//response.status.elapsedTime = HB.stckf() - startTime;
	//response.status.tranCount = hb.tranCount;
	
	//common.headers.json();
	//writeln(common.toJSONString(response));
}

//function getQuote(companyNumber) {
//	hb.set('option', companyNumber);
//	hb.run('hb_aid=enter', 'T003');
//	
//	hb.set('opt2', '1');
//	hb.run('hb_aid=enter', 'T004');
//	
////	writeln('Shares Held = ', hb.getFieldValue('held'));
////	writeln('Total Value = ', hb.getFieldValue('value'));
////	writeln('Company Name = ', hb.getFieldValue('comp41'));
////	writeln('Current Share Price = ', hb.getFieldValue('shrnow'));
////	writeln('User = ', hb.getFieldValue('user41'));
//
//	hb.run('hb_aid=pf3', 'T003');
//	hb.run('hb_aid=pf3', 'T002');
//}


function doit() {
		
	// Enter the first screen showing all the users
	hb.run('hb_aid=pf2&hb_show_literals=1&hb_show_screen=1')
	var numScreen = 0
	var numRows = 4
	
	do { 
		printCurrentScreen()
		 if (hb.getFieldValue('M2TO') == hb.getFieldValue('M2OF')) {
			numRows = 1
			numScreen = 1000
		} 

		for (let i = 0; i < numRows; i++) {
			var fieldName = 'M2A' + (i + 1)
			if (i != 0) {
				appendAccount();
			}
			
			getNameData(fieldName + 'L1',i)	
			getStreetData(fieldName + 'L2',i)	
			getCityStateZipPhoneData(fieldName + 'L3',i)
	
			print('response= ',response.accountList[i].accountNumber)
			print('response= ',response.accountList[i].customer.name.lastName)
			print('response= ',response.accountList[i].customer.address.street)
			print('response= ',response.accountList[i].customer.phoneNumber)
	
		}
		// Advance screen
		hb.run('hb_aid=pf8&hb_show_literals=1&hb_show_screen=1')
				
		numScreen++	
		print(numScreen)
	} while (numScreen < 200)
		
}

function main() {
	//try {
		//let companyNumbers = initialize();
		
		initialize();
		
		doit();
		
		//for (let i = 0; i < companyNumbers.length; i++) {
		//	getQuote(companyNumbers[i]);
		//}
	
	//} catch (e) {
	//	response.status.errors.push(e);
	//} finally {
		terminate();
	//}
	
}

try {
	main();
} catch (e) {
	writeln(e.message);
}

