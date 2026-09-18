# Monteurzimmerblick – Website: Launch-Checkliste

Statische Website, kein Build-Schritt. Alle Dateien in diesem Ordner auf den Webspace von `monteurzimmerblick.de` laden (Root). Lokal testen mit `python3 -m http.server 8765` und `http://localhost:8765`.

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
| `assets/img/og.png` | Vorschaubild für Social Media / Messenger (1200×630) |
| `favicon.svg`, `apple-touch-icon.png` | Icons |
| `robots.txt`, `sitemap.xml` | SEO |

## Erklärvideo

Das Erklärvideo erzählt die Geschichte aus Sicht des Vermieters (acht Szenen, ca. 105 s): zufriedener Kunde fragt nach Hamburg, ohne Monteurzimmerblick endet hier die Reise, mit Monteurzimmerblick wird er an einen Partner vermittelt und der Vermieter verdient daran, jeder ausziehende Kunde wird zur Einnahme, Leerstand füllen, Kunden werden von Stadt zu Stadt empfohlen, kurzer Vertrauenshinweis, Aufruf. Technik (Gebühren, Stripe, Prüfzeitraum) bewusst nur am Rande.

Zwei Formen:

- **Web-Animation** `erklaervideo.html` (im Root): zeitgesteuerte HTML-Animation mit Sprecherstimme (`assets/video/voice/s1.mp3` bis `s8.mp3`, KI-Stimme über Gemini TTS, Stimme „Charon") und Hintergrundmusik (`assets/video/music.mp3`, KI-generiert). Sie ist die Quelle für die MP4 und direkt aufrufbar, der Player auf der Startseite nutzt sie aber nicht. Sprechertext, Szenenlängen (`DUR`-Array) und Einsatzzeiten (`--d`) stehen in der Datei.
- **MP4** `assets/video/erklaervideo.mp4` (1920×1200, H.264 + AAC, 30 fps) für Social Media, YouTube oder Messenger. Neu rendern nach Änderungen: puppeteer-core rendert die Frames über `?export=1` und `window.__render(t)`, ffmpeg (aus dem Python-Paket imageio-ffmpeg) mischt Stimme und Musik. Die Skripte lagen im Session-Scratchpad (`export/render.js`, `export/mux.sh`).

Die erste, technischere Fassung wurde verworfen.

Der Player in `index.html` spielt die fertige Datei `assets/video/erklaervideo.mp4` (Bild, Stimme und Musik in einer Spur, dadurch synchron auf Handy und Desktop). Nach Änderungen an der Animation muss die MP4 neu gerendert werden. Ein neues Video einfach unter demselben Namen ablegen.

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

- Erklärvideo (Igor wünscht sich eines) in den Hero-Bereich oder unter „So funktioniert es" einbinden.
- Englische Version der Landingpage, sobald die Plattform mehrsprachig läuft.
- Backlinks setzen, Search Console anmelden, `sitemap.xml` einreichen.
