/**
 * Névtelen látogatottságmérés – Gondviselés Gyógyszertár
 * Google Apps Script webalkalmazás + Google Sheet (a Sheethez kötött szkriptként telepítendő).
 *
 * Elvek (a megbízás szerint):
 *  - csak előre megadott (fehérlistás) értékek és mezők kerülnek a Sheetbe, minden más eldobásra kerül;
 *  - nincs IP-cím, nincs azonosító, nincs süti, nincs kérésfejléc-naplózás (a szkript a fejléceket nem is látja);
 *  - a nyers napló időpontja órára kerekített (adattakarékosság: egyedi látogató útja nem rekonstruálható);
 *  - a nyers napló 90 nap után törlődik, az óránkénti összesítés megmarad (anonim, összesített adat);
 *  - a mérés OLDALMEGTEKINTÉSEKET és ESEMÉNYEKET számol, nem egyedi látogatókat.
 *
 * Első használat: futtasd a setup() függvényt (létrehozza a lapokat, a triggereket és az irányítópultot),
 * majd telepítsd webalkalmazásként (lásd: telepitesi-utmutato.md).
 */

var TZ = 'Europe/Budapest';
var SHEET_NAPLO = 'Naplo';
var SHEET_AGGR = 'Aggr_Ora';
var SHEET_DASH = 'Iranyitopult';
var SHEET_SET = 'Beallitasok';

var NAPLO_HEAD = ['Idő (óra)', 'Oldal', 'Esemény', 'Forrás típus', 'Hivatkozó domain', 'UTM source', 'UTM medium', 'UTM campaign', 'Eszköz', 'Rendszer', 'Megjelenítés', 'Nyelv'];
var AGGR_HEAD = NAPLO_HEAD.concat(['Darab']);
var N_COLS = NAPLO_HEAD.length;        // 12
var A_COLS = AGGR_HEAD.length;         // 13

// ---------- fehérlisták (csak ezek az értékek fogadhatók el) ----------
function set_(arr) { var o = {}; for (var i = 0; i < arr.length; i++) o[arr[i]] = true; return o; }
var OLDALAK = set_(['fooldal', 'jatekok', 'egeszsegugyi-kviz', 'napi-kihivas', 'gyogynoveny-teszt',
  'web-gyogyszeresz', 'receptek', 'tunetek-kereso', 'gyogyszer-labirintus', 'dokumentumtar', 'szinezok',
  'blog-tortenelem', 'tortenelmunk-galeria', 'adatkezeles', 'impresszum']);
var ESEMENYEK = set_(['pageview', 'game_start', 'game_over', 'quiz_start', 'phone_open', 'news_open', 'install_click']);
var FORRASOK = set_(['kozvetlen', 'kereso', 'kozossegi', 'egyeb']);
var ESZKOZOK = set_(['mobil', 'tablet', 'asztali']);
var RENDSZEREK = set_(['iOS', 'Android', 'Windows', 'macOS', 'egyeb']);
var MEGJELENITESEK = set_(['bongeszo', 'telepitett_app']);
var NYELVEK = set_(['hu', 'en', 'de', 'egyeb']);
var RE_DOMAIN = /^[a-z0-9](?:[a-z0-9.-]{0,58}[a-z0-9])?$/;
var RE_UTM = /^[a-z0-9_-]{1,40}$/;

// ---------- belépési pontok ----------

/** A kliens (stats.js) ide küld POST kérést. Semmilyen kérésfejlécet nem naplózunk. */
function doPost(e) {
  try {
    var cfg = getSettings_();
    if (String(cfg.aktiv).toUpperCase() !== 'IGEN') return out_('off');
    if (!e || !e.postData || typeof e.postData.contents !== 'string' || e.postData.contents.length > 1500) return out_('bad');
    var obj;
    try { obj = JSON.parse(e.postData.contents); } catch (err) { return out_('bad'); }
    var row = validate_(obj);
    if (!row) return out_('bad');

    var lock = LockService.getScriptLock();
    if (!lock.tryLock(8000)) return out_('busy');
    try {
      if (!rateOk_(parseInt(cfg.percenkenti_limit, 10) || 120)) return out_('limit');
      var sh = sheet_(SHEET_NAPLO);
      sh.getRange(sh.getLastRow() + 1, 1, 1, N_COLS).setValues([row]);
    } finally {
      lock.releaseLock();
    }
    return out_('ok');
  } catch (err) {
    return out_('err');   // a hibát szándékosan nem naplózzuk (nem kerülhet adat a naplóba)
  }
}

/** Böngészőből megnyitva csak azt mutatja, hogy a végpont él – adatot nem ad ki. */
function doGet() { return out_('A mérés végpontja működik.'); }

function out_(text) { return ContentService.createTextOutput(text); }

// ---------- érvényesítés ----------

function str_(v) { return (typeof v === 'string' && v.length <= 80) ? v : ''; }

/** Formula-injekció elleni védelem: a =, +, -, @ jellel kezdődő szöveg elé aposztróf kerül. */
function safe_(v) {
  if (typeof v !== 'string') return v;
  return /^[=+\-@\t\r]/.test(v) ? "'" + v : v;
}

/** @return a Naplo lap egy sora (tömb), vagy null, ha a kérés érvénytelen. Csak a fehérlistás mezők kerülnek át. */
function validate_(o) {
  if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
  if (o.v !== 1) return null;
  var oldal = str_(o.oldal), esemeny = str_(o.esemeny);
  if (!OLDALAK[oldal] || !ESEMENYEK[esemeny]) return null;
  var eszkoz = str_(o.eszkoz), rendszer = str_(o.rendszer), megj = str_(o.megjelenites), nyelv = str_(o.nyelv);
  if (!ESZKOZOK[eszkoz] || !RENDSZEREK[rendszer] || !MEGJELENITESEK[megj] || !NYELVEK[nyelv]) return null;

  var forras = '', domain = '', us = '', um = '', uc = '';
  if (esemeny === 'pageview') {       // forrás és UTM csak oldalmegtekintésnél értelmezett
    var f = str_(o.forras);
    forras = FORRASOK[f] ? f : '';
    var d = str_(o.domain).toLowerCase();
    domain = (forras && forras !== 'kozvetlen' && RE_DOMAIN.test(d)) ? d : '';
    us = RE_UTM.test(str_(o.utm_source)) ? o.utm_source : '';
    um = RE_UTM.test(str_(o.utm_medium)) ? o.utm_medium : '';
    uc = RE_UTM.test(str_(o.utm_campaign)) ? o.utm_campaign : '';
  }
  return [hourStart_(), oldal, esemeny, forras, safe_(domain), safe_(us), safe_(um), safe_(uc), eszkoz, rendszer, megj, nyelv];
}

/** Az idő órára kerekítve (Europe/Budapest, a projekt időzónája). */
function hourStart_() { var d = new Date(); d.setMinutes(0, 0, 0); return d; }

/** Globális percenkénti korlát a tömeges küldés ellen (a LockService zárján belül hívandó). */
function rateOk_(limit) {
  var cache = CacheService.getScriptCache();
  var key = 'rl' + Math.floor(Date.now() / 60000);
  var n = parseInt(cache.get(key) || '0', 10);
  if (n >= limit) return false;
  cache.put(key, String(n + 1), 120);
  return true;
}

// ---------- lapok, beállítások ----------

function ss_() {
  var ss = null;
  try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (e) {}
  if (ss) return ss;
  var id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  return SpreadsheetApp.openById(id);
}

function sheet_(name) {
  var sh = ss_().getSheetByName(name);
  if (!sh) throw new Error('Hiányzó lap: ' + name + ' (futtasd a setup() függvényt)');
  return sh;
}

var DEFAULTS = [
  ['aktiv', 'IGEN', 'IGEN = a mérés fogad adatot; NEM = a végpont semmit nem ír a Sheetbe (vészkapcsoló).'],
  ['percenkenti_limit', 120, 'Globális korlát: ennyi kérést fogad el percenként (a tömeges küldés ellen).'],
  ['megorzes_nap', 90, 'A nyers napló (Naplo) ennyi nap után törlődik. Az összesítés megmarad.'],
  ['aggr_utolso_sor', 1, 'Automatikus: a Naplo lap eddig a sorig van összesítve. Ne módosítsd.'],
  ['utolso_osszesites', '', 'Automatikus: az utolsó óránkénti összesítés ideje.'],
  ['utolso_torles', '', 'Automatikus: az utolsó törlés ideje és a törölt sorok száma.']
];

function getSettings_() {
  var sh = sheet_(SHEET_SET), last = sh.getLastRow(), cfg = {};
  if (last < 1) return cfg;
  var vals = sh.getRange(1, 1, last, 2).getValues();
  for (var i = 0; i < vals.length; i++) if (vals[i][0]) cfg[String(vals[i][0])] = vals[i][1];
  return cfg;
}

function setSetting_(key, value) {
  var sh = sheet_(SHEET_SET), last = sh.getLastRow();
  var vals = last ? sh.getRange(1, 1, last, 1).getValues() : [];
  for (var i = 0; i < vals.length; i++) {
    if (String(vals[i][0]) === key) { sh.getRange(i + 1, 2).setValue(value); return; }
  }
  sh.getRange(last + 1, 1, 1, 2).setValues([[key, value]]);
}

// ---------- óránkénti összesítés (időzített trigger) ----------

function aggregateHourly() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return 0;
  try {
    var cfg = getSettings_();
    var naplo = sheet_(SHEET_NAPLO), aggr = sheet_(SHEET_AGGR);
    var last = naplo.getLastRow();
    var from = Math.max(2, (parseInt(cfg.aggr_utolso_sor, 10) || 1) + 1);
    if (last < from) { setSetting_('utolso_osszesites', stamp_()); return 0; }

    var rows = naplo.getRange(from, 1, last - from + 1, N_COLS).getValues();
    var counts = {}, order = [];
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (!(r[0] instanceof Date)) continue;
      var key = r.map(function (c) { return c instanceof Date ? c.getTime() : String(c); }).join('\u241F');
      if (!counts[key]) { counts[key] = { row: r, n: 0 }; order.push(key); }
      counts[key].n++;
    }
    var out = order.map(function (k) { return counts[k].row.concat([counts[k].n]); });
    if (out.length) {
      var start = aggr.getLastRow() + 1;
      aggr.getRange(start, 1, out.length, A_COLS).setValues(out);
    }
    setSetting_('aggr_utolso_sor', last);
    setSetting_('utolso_osszesites', stamp_());
    return out.length;
  } finally {
    lock.releaseLock();
  }
}

function stamp_() { return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm'); }

// ---------- megőrzés: a nyers napló törlése (napi trigger) ----------

/** Naponta fut: a megorzes_nap napnál régebbi, már összesített nyers sorokat törli. */
function purgeOld() {
  var cfg = getSettings_();
  return purgeOld_(parseFloat(cfg.megorzes_nap) || 90);
}

/**
 * @param days küszöb napban (törtszám is lehet). Csak a már összesített sorokat törli, ezért adat nem vész el.
 * @return a törölt sorok száma
 */
function purgeOld_(days) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return 0;
  try {
    var cfg = getSettings_();
    var naplo = sheet_(SHEET_NAPLO), last = naplo.getLastRow();
    if (last < 2) return 0;
    var aggregated = Math.max(0, (parseInt(cfg.aggr_utolso_sor, 10) || 1) - 1);
    var cutoff = new Date(Date.now() - days * 86400000);
    var times = naplo.getRange(2, 1, last - 1, 1).getValues();
    var n = 0;
    while (n < times.length && times[n][0] instanceof Date && times[n][0] < cutoff) n++;
    if (n > aggregated) n = aggregated;
    if (n > 0) {
      naplo.deleteRows(2, n);
      setSetting_('aggr_utolso_sor', Math.max(1, (parseInt(cfg.aggr_utolso_sor, 10) || 1) - n));
    }
    setSetting_('utolso_torles', stamp_() + ' – ' + n + ' sor');
    return n;
  } finally {
    lock.releaseLock();
  }
}

// ---------- első beállítás ----------

/** Egyszeri beállítás: lapok, fejlécek, alapértékek, triggerek, irányítópult. Többször is futtatható. */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  PropertiesService.getScriptProperties().setProperty('SHEET_ID', ss.getId());
  ss.setSpreadsheetTimeZone(TZ);
  ss.setSpreadsheetLocale('en_US');   // a képletek (vesszős elválasztó, TEXT formátumkódok) nyelvfüggetlen működéséhez; magyar beállításnál #ERROR! jönne

  var naplo = ensureSheet_(ss, SHEET_NAPLO);
  var aggr = ensureSheet_(ss, SHEET_AGGR);
  ensureSheet_(ss, SHEET_DASH);
  var set = ensureSheet_(ss, SHEET_SET);

  if (naplo.getLastRow() < 1) {
    naplo.getRange(1, 1, 1, N_COLS).setValues([NAPLO_HEAD]).setFontWeight('bold');
    naplo.setFrozenRows(1);
  }
  naplo.getRange(2, 1, naplo.getMaxRows() - 1, 1).setNumberFormat('yyyy-mm-dd hh:mm');
  naplo.getRange(2, 2, naplo.getMaxRows() - 1, N_COLS - 1).setNumberFormat('@');   // szövegként tárol: nincs képlet-értelmezés

  if (aggr.getLastRow() < 1) {
    aggr.getRange(1, 1, 1, A_COLS).setValues([AGGR_HEAD]).setFontWeight('bold');
    aggr.setFrozenRows(1);
  }
  aggr.getRange(2, 1, aggr.getMaxRows() - 1, 1).setNumberFormat('yyyy-mm-dd hh:mm');
  aggr.getRange(2, 2, aggr.getMaxRows() - 1, A_COLS - 2).setNumberFormat('@');

  if (set.getLastRow() < 1) {
    set.getRange(1, 1, DEFAULTS.length, 3).setValues(DEFAULTS);
    set.getRange(1, 1, DEFAULTS.length, 1).setFontWeight('bold');
    set.setColumnWidth(3, 520);
  }

  setupTriggers();
  setupDashboard();
  SpreadsheetApp.getActive().toast('Kész. Következő lépés: Telepítés → Új telepítés → Webalkalmazás.', 'Beállítás', 8);
}

function ensureSheet_(ss, name) { return ss.getSheetByName(name) || ss.insertSheet(name); }

function setupTriggers() {
  var existing = ScriptApp.getProjectTriggers();
  for (var i = 0; i < existing.length; i++) {
    var h = existing[i].getHandlerFunction();
    if (h === 'aggregateHourly' || h === 'purgeOld') ScriptApp.deleteTrigger(existing[i]);
  }
  ScriptApp.newTrigger('aggregateHourly').timeBased().everyHours(1).create();
  ScriptApp.newTrigger('purgeOld').timeBased().atHour(3).everyDays(1).create();
}

// ---------- irányítópult ----------

/** Létrehozza (újra) az Iranyitopult lapot: segédtáblák képletekkel + 11 grafikon. Bármikor újrafuttatható. */
function setupDashboard() {
  var ss = ss_();
  ss.setSpreadsheetLocale('en_US');   // lásd a setup()-ban: magyar nyelvű Sheetben a vesszős képletek elemzési hibát adnának
  var sh = ss.getSheetByName(SHEET_DASH) || ss.insertSheet(SHEET_DASH);
  var charts = sh.getCharts();
  for (var i = 0; i < charts.length; i++) sh.removeChart(charts[i]);
  sh.clear();
  sh.setHiddenGridlines(true);

  sh.getRange('A1').setValue('Névtelen látogatottságmérés – irányítópult').setFontSize(16).setFontWeight('bold');
  sh.getRange('A2').setValue('A mérés oldalmegtekintéseket és eseményeket számol, nem egyedi látogatókat. Az adatok óránként frissülnek (összesítés).').setFontColor('#666666');
  sh.getRange('A4').setValue('Időszak (népszerű oldalak, források, eszközök, események):').setFontWeight('bold');
  sh.getRange('B4').setValue('Utolsó 30 nap').setBackground('#fff8e1');
  sh.getRange('B4').setDataValidation(SpreadsheetApp.newDataValidation()
    .requireValueInList(['Utolsó 7 nap', 'Utolsó 30 nap', 'Utolsó 12 hónap', 'Összes'], true).setAllowInvalid(false).build());
  sh.getRange('A5').setValue('Kezdő dátum (automatikus)').setFontColor('#888888');
  sh.getRange('B5').setFormula('=IF(B4="Utolsó 7 nap",TODAY()-7,IF(B4="Utolsó 30 nap",TODAY()-30,IF(B4="Utolsó 12 hónap",EDATE(TODAY(),-12),DATE(2000,1,1))))')
    .setNumberFormat('yyyy-mm-dd').setFontColor('#888888');
  sh.setColumnWidth(1, 330);

  // --- segédtáblák (a grafikonok forrásai), a T oszloptól jobbra ---
  var pv = 'Aggr_Ora!$M:$M,Aggr_Ora!$C:$C,"pageview"';
  function timeTable(col, head1, rows, labelF, fromF, toF) {
    sh.getRange(5, col, 1, 2).setValues([[head1, 'Oldalmegtekintés']]).setFontWeight('bold');
    var labels = [], vals = [];
    for (var r = 0; r < rows; r++) {
      var rr = 6 + r;
      labels.push([labelF.replace(/\{r\}/g, rr)]);
      vals.push(['=SUMIFS(' + pv + ',Aggr_Ora!$A:$A,">="&(' + fromF.replace(/\{r\}/g, rr) + '),Aggr_Ora!$A:$A,"<"&(' + toF.replace(/\{r\}/g, rr) + '))']);
    }
    sh.getRange(6, col, rows, 1).setFormulas(labels);
    sh.getRange(6, col + 1, rows, 1).setFormulas(vals);
  }
  timeTable(20, 'Óra (ma)', 24, '=TEXT(TODAY()+({r}-6)/24,"HH:mm")', 'TODAY()+({r}-6)/24', 'TODAY()+({r}-5)/24');
  timeTable(23, 'Nap', 30, '=TEXT(TODAY()-29+({r}-6),"MM.dd.")', 'TODAY()-29+({r}-6)', 'TODAY()-28+({r}-6)');
  timeTable(26, 'Hónap', 12, '=TEXT(EDATE(DATE(YEAR(TODAY()),MONTH(TODAY()),1),{r}-17),"yyyy.MM")',
    'EDATE(DATE(YEAR(TODAY()),MONTH(TODAY()),1),{r}-17)', 'EDATE(DATE(YEAR(TODAY()),MONTH(TODAY()),1),{r}-16)');
  timeTable(29, 'Év', 5, '=YEAR(TODAY())-4+({r}-6)&""', 'DATE(YEAR(TODAY())-4+({r}-6),1,1)', 'DATE(YEAR(TODAY())-3+({r}-6),1,1)');

  function q(col, select, where, label1, label2) {
    var f = '=IFERROR(QUERY(Aggr_Ora!$A$2:$M,"select ' + select + ', sum(M) where ' + where +
      " and A >= datetime '\"&TEXT($B$5,\"yyyy-MM-dd\")&\" 00:00:00' group by " + select + ' order by sum(M) desc limit 10 label ' + select +
      " '" + label1 + "', sum(M) '" + label2 + "'\",0),{\"" + label1 + '","' + label2 + '"})';
    sh.getRange(5, col).setFormula(f);
  }
  q(32, 'B', "C = 'pageview'", 'Oldal', 'Oldalmegtekintés');
  q(35, 'D', "C = 'pageview' and D <> ''", 'Forrás típus', 'Oldalmegtekintés');
  q(38, 'F', "C = 'pageview' and F <> ''", 'UTM source', 'Oldalmegtekintés');
  q(41, 'I', "C = 'pageview'", 'Eszköz', 'Oldalmegtekintés');
  q(44, 'J', "C = 'pageview'", 'Rendszer', 'Oldalmegtekintés');
  q(47, 'K', "C = 'pageview'", 'Megjelenítés', 'Oldalmegtekintés');
  q(50, 'C', "C <> 'pageview'", 'Esemény', 'Esemény darabszám');

  // --- grafikonok ---
  var errors = [];
  function chart(type, a1, title, row, col, legend) {
    try {
      sh.insertChart(sh.newChart().setChartType(type).addRange(sh.getRange(a1)).setNumHeaders(1)
        .setPosition(row, col, 0, 0).setOption('title', title).setOption('width', 620).setOption('height', 300)
        .setOption('legend', { position: legend ? 'right' : 'none' }).build());
    } catch (e) { errors.push(title + ': ' + e.message); }
  }
  var C = Charts.ChartType;
  chart(C.COLUMN, 'T5:U29', '1. Óránkénti oldalmegtekintés (mai nap)', 8, 1, false);
  chart(C.COLUMN, 'W5:X35', '2. Napi oldalmegtekintés (utolsó 30 nap)', 8, 9, false);
  chart(C.COLUMN, 'Z5:AA17', '3. Havi oldalmegtekintés (utolsó 12 hónap)', 24, 1, false);
  chart(C.COLUMN, 'AC5:AD10', '4. Éves oldalmegtekintés', 24, 9, false);
  chart(C.BAR, 'AF5:AG15', '5. Legnépszerűbb oldalak (oldalmegtekintés)', 40, 1, false);
  chart(C.PIE, 'AI5:AJ15', '6a. Forrás típusok (oldalmegtekintés)', 40, 9, true);
  chart(C.BAR, 'AL5:AM15', '6b. UTM források (oldalmegtekintés)', 56, 1, false);
  chart(C.PIE, 'AO5:AP15', '7a. Eszköz típusa (oldalmegtekintés)', 56, 9, true);
  chart(C.PIE, 'AR5:AS15', '7b. Rendszer (oldalmegtekintés)', 72, 1, true);
  chart(C.PIE, 'AU5:AV15', '8. Telepített app és böngésző (oldalmegtekintés)', 72, 9, true);
  chart(C.BAR, 'AX5:AY15', '9. Események (pl. játékindítások)', 88, 1, false);

  if (errors.length) {
    sh.getRange('A6').setValue('Néhány grafikon nem jött létre: ' + errors.join(' | ')).setFontColor('#b71c1c');
  }
  return errors;
}

// ---------- tesztek (a szerkesztőből futtathatók) ----------

/** Beküld egy mintaadatot úgy, mintha a weboldal küldte volna – a Naplo lapon meg kell jelennie. */
function tesztPostBe() {
  var sample = { v: 1, oldal: 'fooldal', esemeny: 'pageview', eszkoz: 'mobil', rendszer: 'Android', megjelenites: 'bongeszo',
    nyelv: 'hu', forras: 'kereso', domain: 'google.com', utm_source: 'plakat', utm_medium: 'qr', utm_campaign: 'teszt' };
  var res = doPost({ postData: { contents: JSON.stringify(sample) } });
  return res.getContent();   // "ok", ha a sor bekerült
}

/** A törlés tesztje kis küszöbbel (1 óra): csak már összesített, 1 óránál régebbi sorokat töröl. */
function tesztTorles() { return purgeOld_(1 / 24); }

/** Az összesítés kézi futtatása teszthez. */
function tesztOsszesites() { return aggregateHourly(); }
