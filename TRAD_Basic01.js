// TRAD Basic01
// Copy into Eclipse as an TRAD_Basic01.hbx file
// http://mstrsvw.lvn.broadcom.net:8000/hbscript/getQ_drb

var hb = new HB.Session();
var common = require('common', 'hbutils');
var debugging = require('debugging', 'hbutils');
common.hbRunProto();
debugging.checkDebugControl();
debugging.global = true;

hb.set('hb_entry', 'trad');
hb.set('hb_timeout', '300');
hb.run('HB_AID=ENTER', 'T002');

hb.set('OPTION', '1');
hb.run('HB_AID=ENTER', 'T003');

hb.set('OPT2', '1');
hb.run('HB_AID=ENTER', 'T004');

writeln('company = ', hb.getFieldValue('COMP41'));
writeln('value   = ', hb.getFieldValue('SHRNOW'));

hb.getFieldValue('HELD');
hb.getFieldValue('VALUE');
hb.run('HB_AID=PF3', 'T003');

hb.run('HB_AID=PF3', 'T002');

hb.run('HB_AID=PF12&hb_delete_session=1');