"use client";

import { useEffect } from "react";

export default function PdfReady() {
    useEffect(() => {
        let cancelled = false;

        const waitForFonts = async (timeout = 3000) => {
            try {
                await Promise.race([
                    // document.fonts.ready resolves when fonts are loaded
                    (document as any).fonts.ready,
                    new Promise((res) => setTimeout(res, timeout)),
                ]);
            } catch (e) {
                // ignore
            }
        };

        const waitForImages = (root: Element | null, timeout = 10000) => {
            if (!root) return Promise.resolve();
            const imgs = Array.from(root.querySelectorAll('img')) as HTMLImageElement[];
            if (imgs.length === 0) return Promise.resolve();

            return new Promise<void>((resolve) => {
                const timers: any[] = [];
                let remaining = imgs.length;

                const checkDone = () => {
                    if (remaining <= 0) {
                        timers.forEach((t) => clearTimeout(t));
                        resolve();
                    }
                };

                imgs.forEach((img) => {
                    if (img.complete) {
                        remaining -= 1;
                        checkDone();
                        return;
                    }

                    const onFinish = () => {
                        remaining -= 1;
                        img.removeEventListener('load', onFinish);
                        img.removeEventListener('error', onFinish);
                        checkDone();
                    };

                    img.addEventListener('load', onFinish);
                    img.addEventListener('error', onFinish);
                });

                // global timeout to avoid waiting forever
                timers.push(setTimeout(() => resolve(), timeout));
            });
        };

        const waitForStability = (root: Element | null, stableMs = 250, timeout = 5000) => {
            if (!root) return Promise.resolve();
            return new Promise<void>((resolve) => {
                let lastMut = Date.now();
                const obs = new MutationObserver(() => {
                    lastMut = Date.now();
                });

                obs.observe(root, { childList: true, subtree: true, attributes: true, characterData: true });

                const checkInterval = setInterval(() => {
                    if (Date.now() - lastMut >= stableMs) {
                        clearInterval(checkInterval);
                        obs.disconnect();
                        resolve();
                    }
                }, 50);

                // safety timeout
                setTimeout(() => {
                    clearInterval(checkInterval);
                    obs.disconnect();
                    resolve();
                }, timeout);
            });
        };

        (async () => {
            try {
                const root = document.querySelector('[data-pdf-root]');

                console.log("root", root)
                
                // 1) wait for fonts (short)
                await waitForFonts(2000);
                console.log("Fonts loaded")
                
                // 2) wait for images under the pdf root
                await waitForImages(root, 10000);
                console.log("Images loaded")
                
                // 3) wait for DOM stability (no mutations for a short window)
                await waitForStability(root, 250, 5000);
                console.log("Stability loaded")
                
                if (!cancelled) {
                    (window as any).__PDF_READY__ = true;
                    console.log("Setttttttttttttttt")
                }
            } catch (err) {
                (window as any).__PDF_READY_ERROR__ = (err as any)?.message || String(err);
                if (!cancelled) (window as any).__PDF_READY__ = true; // still allow fallback
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    return null;
}
