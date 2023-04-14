// TRAD Basic01
// Lo más básico posible
// Copy into Eclipse as an TRAD_Basic01.hbx file
// http://mstrsvw.lvn.broadcom.net:8000/hbscript/TRAD_Basic01

var hb = new HB.Session();

hb.set('hb_entry', 'trad');
hb.set('hb_timeout', '300');
hb.run('hb_aid=ENTER');

hb.set('OPTION', '1');
hb.run('hb_aid=ENTER');

hb.set('OPT2', '1');
hb.run('hb_aid=ENTER');

writeln('company = ', hb.getFieldValue('COMP41'));
writeln('value   = ', hb.getFieldValue('SHRNOW'));
writeln('held    = ', hb.getFieldValue('HELD'));
writeln('value   = ', hb.getFieldValue('VALUE'));

hb.run('hb_aid=PF3');
hb.run('hb_aid=PF3');

hb.run('hb_aid=PF12&hb_delete_session=1');