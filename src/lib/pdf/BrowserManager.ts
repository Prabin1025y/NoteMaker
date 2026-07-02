import puppeteer, { Browser, BrowserContext, LaunchOptions } from "puppeteer";

export class BrowserManager {
    private static browser: Browser | null = null;
    private static browserPromise: Promise<Browser> | null = null;

    private static getLaunchOptions(): LaunchOptions {
        return {
            headless: true,
            timeout: 15000,
        };
    }

    private static async launch(): Promise<Browser> {
        const browser = await puppeteer.launch(this.getLaunchOptions());

        browser.on("disconnected", () => {
            this.browser = null;
            this.browserPromise = null;
        });

        return browser;
    }

    private static async getBrowser(): Promise<Browser> {
        if (this.browser) return this.browser;

        if (this.browserPromise) return this.browserPromise;

        this.browserPromise = this.launch();

        try {
            this.browser = await this.browserPromise;
            return this.browser;
        } finally {
            this.browserPromise = null;
        }
    }

    static async withContext<T>(fn: (context: BrowserContext) => Promise<T>) {
        const browser = await this.getBrowser();
        const context = await browser.createBrowserContext();

        try {
            return await fn(context);
        } finally {
            await context.close();
        }
    }

    static async shutdown() {
        if (!this.browser) return;

        await this.browser.close();

        this.browser = null;
        this.browserPromise = null;
    }
}
