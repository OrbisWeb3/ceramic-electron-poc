# Ceramic + Electron

Combining Electron's deep links with Ceramic's DIDSession to achieve authorization in the browser.\
Powered by Electron (Forge) and Svelte.

> [!WARNING]
> Application protocol registration does not work in development on Linux and MacOS.
> You need to package the app before testing out these features.

## Choices made

Electron app will spin up a local server (`/electron/runServer.cjs`) to serve the browser part of the app (`/browser-frontend`).\
I'd recommend hosting this part so you can further modify the connection page (ie. add additional providers, update the style) without having to redistribute the app.

The above advantage of hosting it externally could be seen as a disadvantage by some, since hosting it locally (somewhat) prevents modifications and opportunities to modify the signing behavior (malware injection).

## File structure

```
/
├── browser-frontend (Svelte app that's launched in the browser)
├── electron
│   │   ├── browser (Build output of browser-frontend)
│   │   └── frontend (Build output of electron-frontend)
│   └── app.config.js (Configure ports and application protocol used)
└── electron-frontend (Svelte app that's launched inside Electron - renderer)
```

## Running the app

1. `npm install`
2. `npm run build:browser` - build the browser part (`/browser-frontend`), as it's not served from a live server
3. `npm run dev` - run the Electron app (`/electron`) and server the renderer Svelte (`/electron-frontend`) from a live server)

## Packaging the app (Svelte Frontend + Browser + Electron)

    npm run package:all

## Packaging the app (Electron only)

    npm run package:electron

## Make (Svelte Frontend + Browser + Electron)

    npm run make:all

## Make (Electron only)

    npm run make:electron
