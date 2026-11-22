# Névtelen látogatottságmérés – telepítési útmutató (Google Sheet + Apps Script)

Ez az útmutató lépésről lépésre végigvezet a Sheet és az Apps Script beállításán. Kb. 15 percet vesz igénybe. A végén kapsz egy webalkalmazás-címet (URL), amit a `stats.js` fájl tetejébe kell beírni (ezt a címet küldd el nekem, és én beírom).

## 0. Előkészület

- Használj olyan Google-fiókot, amelyen be van kapcsolva a kétlépcsős azonosítás.
- **Jogi megjegyzés (kérlek, egyeztesd jogásszal):** az adatok a Google szolgáltatásán keresztül kerülnek a Sheetbe, tehát a Google adatfeldolgozó. Egy sima (ingyenes, személyes) Google-fiókhoz általában nincs külön adatfeldolgozási szerződés (GDPR 28. cikk). Üzleti használatra a Google Workspace-fiók javasolt, ahol a Google adatfeldolgozási kiegészítése elfogadható. Ezt a tájékoztatóban is jelöltem ellenőrzésre.

## 1. A Sheet létrehozása

1. Nyisd meg a <https://sheets.google.com> oldalt, és hozz létre egy **új, üres táblázatot**.
2. Nevezd el, pl. `Gondviselés – látogatottság`.
3. **Ne oszd meg nyilvánosan.** Csak azokkal oszd meg, akiket te nevezel meg (Megosztás → hozzáférés: „Korlátozott”).

## 2. A szkript beillesztése

1. A Sheetben: **Bővítmények → Apps Script**. Megnyílik a szkriptszerkesztő.
2. Töröld a szerkesztőben lévő minta kódot (`function myFunction() {}`), majd másold be a **`Code.gs`** fájl teljes tartalmát.
3. Bal oldalt kattints a fogaskerékre (**Projektbeállítások**), és jelöld be: **„Az „appsscript.json” jegyzékfájl megjelenítése a szerkesztőben”**.
4. Térj vissza a **Szerkesztő** nézetre (`<>` ikon), és kattints a megjelenő `appsscript.json` fájlra. Cseréld a teljes tartalmát erre:

```json
{
  "timeZone": "Europe/Budapest",
  "exceptionLogging": "NONE",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE_ANONYMOUS"
  }
}
```

   (A `NONE` kikapcsolja a hibanaplózást, így semmilyen kérés tartalma sem kerülhet naplóba.)
5. Mentsd el (Ctrl+S).

## 3. Első beállítás: `setup()`

1. A fenti legördülő listából válaszd a **`setup`** függvényt, és kattints a **Futtatás** gombra.
2. A Google engedélyt kér. Kattints: **Engedélyek ellenőrzése** → válaszd ki a fiókodat → **Speciális** → **„… (nem biztonságos) megnyitása”** → **Engedélyezés**. (Ez normális: saját, ellenőrizetlen szkriptről van szó.)
3. A futás végén a Sheetben létrejön négy lap: `Naplo`, `Aggr_Ora`, `Iranyitopult`, `Beallitasok`, és két időzített trigger (óránkénti összesítés, napi törlés).
4. Ellenőrzés: Apps Script bal oldalán **Triggerek** (óra ikon): két bejegyzésnek kell látszania (`aggregateHourly`, `purgeOld`).
5. **Nyelvi beállítás:** a `setup()` a Sheet nyelvét **angolra (en_US)** állítja, mert magyar nyelvű beállításnál a képletek elemzési hibát adnak (`#ERROR!`). A számok és dátumok kijelzése ezért angol formátumú lesz; az adatokat ez nem érinti. Ha az irányítópulton mégis `#ERROR!` látszik, futtasd újra a **`setupDashboard`** függvényt (a frissített `Code.gs` bemásolása után), majd frissítsd az oldalt.

## 4. Telepítés webalkalmazásként

1. Jobb felül: **Telepítés → Új telepítés**.
2. A fogaskerékre kattintva válaszd: **Webalkalmazás**.
3. Beállítások:
   - **Leírás:** `Látogatottságmérés`
   - **Futtatás ezzel a fiókkal:** **Te (saját fiókod)**
   - **Hozzáférés:** **Bárki**
4. Kattints a **Telepítés** gombra, és másold ki a **Webalkalmazás URL-jét** (`https://script.google.com/macros/s/…/exec`).
5. **Ezt az URL-t küldd el nekem.** Én beírom a `stats.js` tetején lévő `ENDPOINT` konstansba.

> Az URL a weboldal forrásában nyilvánosan látható lesz (ez elkerülhetetlen). Ezért csak fehérlistás értékeket fogad, percenkénti korlátja van, és a `Beallitasok` lapon az `aktiv` cellát `NEM`-re állítva azonnal kikapcsolható.

## 5. Tesztelés a weboldal nélkül

1. Szerkesztőben válaszd a **`tesztPostBe`** függvényt, és futtasd. Megnyithatod a futási naplót; a `Naplo` lapon meg kell jelennie egy új sornak (oldal: `fooldal`, esemény: `pageview`).
2. Futtasd a **`tesztOsszesites`** függvényt. Az `Aggr_Ora` lapon megjelenik az összesített sor.
3. Nyisd meg az **`Iranyitopult`** lapot. Ha egy grafikon nem jött létre, az `A6` cellában piros hibaüzenet olvasható. Ilyenkor futtasd újra a **`setupDashboard`** függvényt, és küldd el nekem a hibaüzenetet.
4. A törlés tesztje: futtasd a **`tesztTorles`** függvényt. 1 óránál régebbi, már összesített sorokat töröl. A `Beallitasok` lap `utolso_torles` cellája mutatja az eredményt.

## 6. Mit mutat az irányítópult?

A lap tetején az **Időszak** legördülő (B4) a népszerű oldalak, források, eszközök és események táblázatait állítja. Grafikonok: óránkénti (ma), napi (30 nap), havi (12 hónap), éves oldalmegtekintés; legnépszerűbb oldalak; forrás típusok és UTM források; eszköz és rendszer; telepített app és böngésző; események. A grafikonokon és címekben **oldalmegtekintés** szerepel, nem „látogató”, mert a mérés nem követ egyéni látogatót.

A segédtáblák a lap jobb oldalán (T oszloptól) találhatók, ezeket ne töröld.

## 7. Üzemeltetés

- **Beállítások** (`Beallitasok` lap): `aktiv` (IGEN/NEM vészkapcsoló), `percenkenti_limit` (alapból 120), `megorzes_nap` (alapból 90). A többi cellát ne módosítsd.
- **A szkript módosítása után** új telepítés kell: Telepítés → Telepítések kezelése → ceruza ikon → Verzió: **Új verzió** → Telepítés. Az URL ilyenkor nem változik.
- **Megőrzés:** a nyers napló (`Naplo`) 90 nap után törlődik, naponta egyszer, éjjel 3 óra körül. Csak a már összesített sorokat törli. Az `Aggr_Ora` összesítések megmaradnak (anonim, összesített adat).
- **Időbélyeg:** a nyers naplóban az idő **órára kerekített**, így egy látogató lépéseinek sorrendje nem rekonstruálható. Ez adattakarékossági döntés (GDPR 5. cikk (1) bekezdés c) pont), és a megbízás szövegétől kissé eltér.
- **Hibakeresés:** ha nem jelennek meg sorok, ellenőrizd, hogy a látogató elfogadta-e a *Statisztika* beállítást (sütibeállítás), és hogy az `ENDPOINT` be van-e írva a `stats.js` fájlba.

## 7/b. Elfogadási tesztek – ezeket neked kell lefuttatni

A szimulált környezetben nem tudtam kipróbálni a valódi Google-szolgáltatásokat, ezért ezeket kérlek ellenőrizd a telepítés után:

1. **Hozzájárulás nélkül** a böngésző Hálózat (Network) paneljén nem látszik kérés a `script.google.com` felé.
2. **„Összes elfogadása”** után a `Naplo` lapon megjelenik az oldal és az esemény (a sor 1 percen belül).
3. A Statisztika **kikapcsolása után** nincs új kérés.
4. Az óránkénti összesítés lefutott (`Aggr_Ora`, `Beallitasok → utolso_osszesites`), és a törlés tesztje (`tesztTorles`) működik.

## 8. Eltávolítás / leállítás

- Ideiglenesen: `Beallitasok → aktiv = NEM`.
- Véglegesen: Telepítés → Telepítések kezelése → Archiválás, a triggerek törlése (óra ikon), végül a Sheet törlése.
