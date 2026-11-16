import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";
import sharp from "sharp";

const root = fileURLToPath(new URL("../", import.meta.url));
const [logo, note] = await Promise.all([
    fs.readFile(path.join(root, "public/logo.png")),
    fs.readFile(path.join(root, "public/landing/note-a4-placeholder.svg")),
]);
const icons = path.join(root, "public/icons");
await fs.mkdir(icons, { recursive: true });

async function icon(size) {
    const inset = Math.max(1, Math.round(size * .1));
    return sharp(logo).trim().resize(size - inset * 2, size - inset * 2, { fit: "contain", background: "#ffffff" })
        .flatten({ background: "#ffffff" })
        .extend({ top: inset, bottom: inset, left: inset, right: inset, background: "#ffffff" })
        .ensureAlpha()
        .withMetadata({ exif: { IFD0: { ImageDescription: "Derived from the existing Eton Note logo at public/logo.png; unchanged artwork on a white icon ground." } } })
        .png().toBuffer();
}

await Promise.all([
    [48, "src/app/icon.png"],
    [180, "src/app/apple-icon.png"],
    [192, "public/icons/app-192.png"],
    [512, "public/icons/app-512.png"],
].map(async ([size, file]) => fs.writeFile(path.join(root, file), await icon(size))));

// An ICO directory can contain PNG payloads at each favicon size.
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(icon));
const directory = Buffer.alloc(6 + sizes.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(sizes.length, 4);
let offset = directory.length;
images.forEach((image, index) => {
    const entry = 6 + index * 16;
    directory[entry] = directory[entry + 1] = sizes[index];
    directory.writeUInt16LE(1, entry + 4);
    directory.writeUInt16LE(32, entry + 6);
    directory.writeUInt32LE(image.length, entry + 8);
    directory.writeUInt32LE(offset, entry + 12);
    offset += image.length;
});
await fs.writeFile(path.join(root, "src/app/favicon.ico"), Buffer.concat([directory, ...images]));

const browser = await puppeteer.launch({ headless: true });
try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
    await page.setContent(`<!doctype html><html lang="en"><meta charset="utf-8"><style>
        * { box-sizing: border-box; }
        body { margin: 0; width: 1200px; height: 630px; padding: 64px; display: grid; grid-template-columns: 1fr 310px; gap: 72px; background: white; color: #0f1115; font-family: Inter, sans-serif; }
        .copy { display: flex; flex-direction: column; }
        .brand { display: flex; align-items: center; gap: 14px; font-size: 26px; font-weight: 650; }
        .brand img { width: 44px; height: 44px; object-fit: contain; }
        h1 { margin: 62px 0 0; font-size: 64px; font-weight: 650; line-height: 1.08; letter-spacing: -.035em; }
        h1 span { color: #c78316; }
        .lead { max-width: 500px; margin: 28px 0 0; font-size: 22px; line-height: 1.65; color: #4a4c50; }
        .domain { margin: auto 0 0; font-size: 18px; color: #6b7280; }
        figure { align-self: center; margin: 0; }
        .note { display: block; width: 310px; height: auto; border: 1px solid #e5e7eb; border-radius: 3px; box-shadow: 0 22px 48px -14px #0f11153d; }
        figcaption { margin-top: 16px; font-size: 13px; color: #6b7280; text-align: center; }
    </style><body><div class="copy">
        <div class="brand"><img src="data:image/png;base64,${logo.toString("base64")}" alt="">Eton Note</div>
        <h1>Beautiful notes.<br><span>Less busywork.</span></h1>
        <p class="lead">Text, equations, code, tables, and drawings.<br>One structured study note.</p>
        <p class="domain">etonnote.vercel.app</p>
    </div><figure><img class="note" src="data:image/svg+xml;base64,${note.toString("base64")}" alt="An illustrative physics study note"><figcaption>Illustrative physics note</figcaption></figure></body></html>`, { waitUntil: "load" });
    const screenshot = await page.screenshot({ type: "png" });
    await sharp(screenshot)
        .withMetadata({ exif: { IFD0: { ImageDescription: "Programmatically authored Eton Note social preview. Source artwork: public/logo.png and public/landing/note-a4-placeholder.svg. Layout and copy: scripts/generate-seo-assets.mjs." } } })
        .png().toFile(path.join(root, "public/social-preview.png"));
} finally {
    await browser.close();
}
console.log("Generated the 1200×630 social preview, favicon, browser icon, Apple icon, and app icons.");
