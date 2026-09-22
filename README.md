# DRIVE Leadership

Website für https://drive-leadership.com/.

Statische HTML/CSS/JS-Seite. Quellen in `src/`, inklusive lokaler Bilder und Fonts.

## Lokal prüfen

```
npm run check
npm run build
python3 -m http.server 4173 --directory public
```

## Vercel

Repository importieren. Projekt-Root ist das Repository. Build und Ausgabe sind in `vercel.json` festgelegt. Keine Abhängigkeiten oder Umgebungsvariablen erforderlich.

## Vor Produktionsfreigabe

- Datenschutzhinweise passend zum Hosting ergänzen.
- `noindex,nofollow` erst zur Veröffentlichung entfernen.
- Domain und www-Weiterleitung in Vercel konfigurieren.
- Leseprobe bis zum PDF-Link deaktiviert. KI-Skills angekündigt, noch nicht verfügbar.

Impressum enthält die bereitgestellten Angaben und hello@dominik.design.
Alte Designvarianten, Motivplatzhalter anderer Bücher und Figma-Captures sind nicht enthalten.
