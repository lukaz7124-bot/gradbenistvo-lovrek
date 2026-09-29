# Zemeljska dela in gradbeništvo, Damir Lovrek s.p. — spletna stran

Statična stran (HTML/CSS/JS, brez knjižnic). Izdelano 26. 9. 2026.

## Datoteke

| Pot | Kaj je |
| --- | --- |
| `index.html` | Domača stran: uvod, naslovnica, o nas, storitve, postopek, galerija, mnenja, vprašanja, kontakt |
| `zasebnost.html` | Politika zasebnosti in piškotkov (`#piskotki`) |
| `404.html` | Stran za neobstoječe naslove |
| `assets/styles.css`, `assets/main.js` | Videz in delovanje |
| `assets/img/` | Pretvorjene fotografije (WebP), `plastnice.webp` (tekstura plastnic – namenoma bitna slika fiksne velikosti, ne SVG: raztegnjen SVG je telefonu zamrznil drsenje) |
| `assets/img/src/` | Izvirne fotografije s Facebooka — **niso za objavo** (v `.gitignore`) |
| `assets/og-image.jpg` | Slika za deljenje na Facebooku (1200 × 630) |
| `assets/logo/` | Damirjev logotip, vektoriziran: `lovrek-logo.svg` (izvirne barve), `lovrek-logo-temno.svg` (za temno podlago), `lovrek-logo.png` (1200 px, prosojno) |
| `favicon-32.png`, `favicon-192.png`, `apple-touch-icon.png` | Ikone strani (bager na beli podlagi) |

## Preverjeni podatki (26. 9. 2026)

- Naslov: Medlog 23a, 3000 Celje · Telefon: 031 666 826 (Google, najdi.si, bizi.si)
- E-pošta: damir.lovrek94@gmail.com (Facebook stran)
- Matična št.: 8670951000 · ID za DDV: SI25137247 · vpis 1. 7. 2020 (bizi.si)
- Google: 5,0 ★ (1 mnenje, Anda Marinović, brez besedila) · Facebook: 1,5 tis. sledilcev
- Storitve iz opisa na Facebooku: izkopi z gradbeno mehanizacijo, rušitvena dela, prevozi in dobava materiala, škarpe, temeljne plošče, drenaže, robniki in tlakovanje. Čistilne naprave, kanalizacija in asfalt so razvidni iz fotografij.
- Vozni park (Damir, 29. 9. 2026): traktor John Deere 7430 Premium (JCB Fastrac nimajo več – na fotografiji voznega parka je še, zato ga opisi ne omenjajo), kolesni bager Wacker Neuson, bager Kobelco, mini bager.
- Dodatni storitvi (Damir, 29. 9. 2026): kiper prevozi in zimska služba (pluženje snega, posipanje).

## DEPLOY STEP — pred objavo

```
grep -rn "DEPLOY STEP" .
```

1. **Domena**: stran je živa na `https://gradbenistvo-lovrek.vercel.app` (Vercel, povezan z GitHubom – vsak push se objavi sam). Če bo lastna domena, jo zamenjaj (canonical, og:*, JSON-LD, `sitemap.xml`, `robots.txt`).
2. **Delovni čas** Pon–Pet 8.00–16.00 je z moja-dejavnost.si (»po dogovoru«) — potrdi z Damirjem (`index.html` kontakt in noga, JSON-LD).
3. **Besedilo »O nas«** (»Damir je na gradbišču osebno …«) in odgovori v Vprašanjih so splošni — naj jih Damir prebere.
4. **Gostitelj** v politiki zasebnosti je Vercel — popravi, če bo drugje.
5. Na Google profil podjetja dodaj naslov spletne strani (»Dodaj spletno mesto« je prazno).

## Kako deluje

- **Logotip**: Damirjev logotip (oranžni bager + LOVREK) je vektoriziran in vgrajen v vsako stran kot `<defs>` s skupinami `#lv-exc` (bager), `#lv-word` (LOVREK), `#lv-sub` (podnapis). Barve se nastavijo s spremenljivkami `--lv-ink`, `--lv-bk`, `--lv-dk` … – na temni podlagi (glava, noga) sta napis in žlica svetla.
- **Uvod**: na svetli podlagi se dvigneta telo in kabina, roka bagra se dvigne v položaj, žlica zajame zemljo (padejo grude), dvignejo se črke LOVREK in podnapis, nato se zavesa dvigne. Vse v barvah logotipa. Enkrat na sejo (`sessionStorage` `lv-uvod`), pri zmanjšanem gibanju ga ni, brez JS ga ni. Klik, tipka ali kolešček ga preskočijo. `?gibanje=1` v naslovu ga vsili ob vsakem nalaganju (za preverjanje).
- **Povpraševanje**: gumb »Pošlji prek Gmaila« na računalniku odpre Gmailovo okno za pisanje s prejemnikom, zadevo in vsemi vpisanimi podatki; na telefonu (dotik) odpre e-poštno aplikacijo (`mailto:`), ker spletni Gmail na telefonu izgubi izpolnjena polja. Podatki ne gredo na noben strežnik.
- **Piškotki**: brez soglasja samo nujna shramba (`lv-piskotki`, `lv-uvod`). Google zemljevid se naloži le s soglasjem »Zunanje vsebine« ali ob kliku »Prikaži zemljevid«.
- **Galerija**: 34 fotografij, filtri po vrsti dela (izkopi, škarpe, temelji in beton, drenaže in kanalizacija, tlakovanje, asfalt, mehanizacija). Pri »Vse« je najprej 12 fotografij, gumb pokaže vse. Pod galerijo povezava »Več slik na Facebooku«.
- **Facebook**: ikona v glavi desno zgoraj (tudi v mobilnem meniju, galeriji, mnenjih, vprašanjih in nogi) vodi na https://www.facebook.com/profile.php?id=100041220168294.

## Nova fotografija v galeriji

1. Izvirnik v `assets/img/src/`.
2. Pretvori (pokončna, izrez 4:5): `ffmpeg -i vir.jpg -vf "crop=iw:iw*5/4,scale=480:-2" -quality 78 assets/img/g-ime-480.webp` (in `-800`), povečava: `scale=-2:1600` → `g-ime-1600.webp`. Ležeče: izrez 8:5, velikosti 800 in 1200, razred `wide`.
3. V `index.html` kopiraj en `<a class="g-item">` in spremeni `data-cat`, `data-cap`, `alt` in poti. Števila v filtrih popravi ročno.
