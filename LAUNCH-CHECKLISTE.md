# Monteurzimmerblick – Website: Launch-Checkliste

Statische Website, kein Build-Schritt. Alle Dateien in diesem Ordner auf den Webspace von `monteurzimmerblick.de` laden (Root), außer `werkzeuge/`. Lokal testen mit `python3 -m http.server 8765` und `http://localhost:8765`.

## Dateien

| Datei | Zweck |
| --- | --- |
| `index.html` | Landingpage (heller SaaS-Look, Erklärvideo-Player, Lead-Ticker) |
| `impressum.html` | Impressum |
| `datenschutz.html` | Datenschutzerklärung |
| `assets/css/styles.css` | Stylesheet |
| `assets/js/main.js`, `assets/js/site.js` | Navigation, Scroll-Reveal, Gebührenrechner, Routen-Animation, Ticker, Video-Player |
| `assets/fonts/` | Selbst gehostete Schriften (Inter, Inter Tight, IBM Plex Mono; OFL) |
| `assets/img/mascot.svg` | Maskottchen (Vektor) |
| `erklaervideo.html`, `assets/video/` | Erklärvideo (Quelle, MP4, Ton) |
| `assets/img/og.png` | Vorschaubild für Social Media / Messenger (1200×630) |
| `favicon.svg`, `apple-touch-icon.png` | Icons |
| `robots.txt`, `sitemap.xml` | SEO |

## Erklärvideo

Das Erklärvideo (ca. 76 s, Motion Graphics im Stil der Seite) erzählt die Geschichte von Herrn Berger, Vermieter in Magdeburg: Sein Kunde zieht zur nächsten Baustelle nach Hamburg, früher war die Anfrage damit weg. Heute gibt er sie über Monteurzimmerblick an einen geprüften Vermieter in Hamburg weiter und bekommt für jede vermittelte Anfrage eine Provision. Umgekehrt sucht er bei Leerstand gezielt eine passende Anfrage für genau diese Wohnung und kauft sie. Ergebnis: weniger Leerstand, Provisionen als Extra-Einnahme, mehr Rendite je Wohnung. Die Kunden werden von Stadt zu Stadt weiterempfohlen. Schluss: „Win-win-win“ und kostenlos starten auf monteurzimmerblick.de. Keine Preise oder Prozentzahlen.

- **MP4** `assets/video/erklaervideo.mp4` (1920×1080, 60 fps, H.264 + AAC, ca. 13 MB). Der Player in `index.html` spielt diese Datei (Bild, Stimme, Musik und Geräusche in einer Spur). Vorschaubild: `assets/img/video-poster.png`.
- **Quelle** `erklaervideo.html` (im Root, `noindex`): pausierte GSAP-Timeline (Bibliothek in `assets/video/lib/`), Szenen als SVG. Die Timeline richtet sich nach den Wortzeiten der Sprecheraufnahme (`WORDS`, `VO_SEGS`). Direkt im Browser aufrufbar, spielt dann den Ton aus der MP4.
- **Figuren** `assets/video/figuren.js`: Herr Berger, der Hamburger Vermieter und der Monteur als SVG-Rig mit Knie, Ellbogen, Mimik, Atmen und Blinzeln; Gesten wie Winken, Handschlag, Schulterzucken. Prüfseite: `werkzeuge/erklaervideo/figuren-test.html`.
- **Ton** `assets/video/sprecher.mp3` (eine Aufnahme, Gemini TTS, Stimme „Charon“, wird in Sätze geschnitten) und `assets/video/musik.mp3` (ElevenLabs Music; das Ende wird beim Mischen taktgenau verlängert). Die Geräusche entstehen beim Mischen.
- **Neu bauen** mit `werkzeuge/erklaervideo/baue.sh` (Anleitung im Skript): rendert alle Bilder über Chrome, mischt den Ton auf -16 LUFS und schreibt MP4 und Vorschaubild. Standbilder zum Prüfen: `node werkzeuge/erklaervideo/stills.js 12.5 30`, danach `kontaktbogen.sh`.

Der Ordner `werkzeuge/` gehört nicht auf den Webspace.

## Vor dem Livegang ergänzen

- [ ] **Impressum:** HRB-Nummer, USt-IdNr., Telefonnummer (gelb markierte Felder).
- [ ] **Datenschutz:** Hosting-Anbieter und Speicherdauer der Logfiles (gelb markierte Felder). Rechtliche Prüfung empfohlen.
- [ ] **E-Mail-Adresse:** `kontakt@monteurzimmerblick.de` ist als Kontaktadresse eingetragen. Postfach anlegen oder Adresse in allen drei HTML-Dateien ersetzen.
- [ ] **Plattform-Gebühr:** Die Seite nennt „10 % pro verkauftem Lead, keine Grundgebühr". Die ältere technische Spezifikation nannte 6 % je Seite. Vor Launch final abstimmen; Stellen: FAQ und JSON-LD in `index.html` (die Preise-Sektion nennt keine Prozentzahl mehr; der Rendite-Rechner in `site.js` rechnet mit 200 € pro vermitteltem Kunden).
- [ ] **App-Links:** Buttons verweisen auf `https://app.monteurzimmerblick.de/register` und `/login`. Prüfen, ob die Routen so heißen. Sonst in allen drei HTML-Dateien anpassen.
- [ ] **SSL der App:** Am 16.09.2026 lieferte `app.monteurzimmerblick.de` ein Zertifikat, das nicht auf die Domain ausgestellt ist (Browser warnen). Marco muss ein passendes Zertifikat einspielen, sonst laufen alle CTAs ins Leere.
- [ ] **Hauptdomain:** `monteurzimmerblick.de` zeigt aktuell auf eine Apache-Standardseite (Strato). DNS bzw. Webspace für die Website einrichten.
- [ ] **Beispieldaten:** Die Lead-Tabelle im Abschnitt „Plattform" ist als „Beispieldaten" gekennzeichnet. Wenn echte Zahlen vorliegen, austauschen.

## Optional nach Launch

- Englische Version der Landingpage, sobald die Plattform mehrsprachig läuft.
- Backlinks setzen, Search Console anmelden, `sitemap.xml` einreichen.
