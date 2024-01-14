import { Cluster } from "puppeteer-cluster";

import { Screenshot } from "./models/Screenshot";
import { makeScreenshot } from "./screenshot";
import { Options, StartOptions, ScreenshotParams } from "./types";

export class NodeHtml {
  #cluster: Cluster<ScreenshotParams> = undefined

  async start(options?: StartOptions) {
    const {
      puppeteerArgs = {},
      timeout = 30000,
      puppeteer = undefined,
    } = options || { puppeteerArgs: {}, timeout: 30000, puppeteer: undefined };
    this.#cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_CONTEXT,
      maxConcurrency: 2,
      timeout,
      puppeteerOptions: { ...puppeteerArgs, headless: 'new' },
      puppeteer: puppeteer,
    });
  }

  async execute(options: Options) {
    const {
      html,
      encoding,
      transparent,
      content,
      output,
      selector,
      type,
      quality
    } = options;
    if (this.#cluster == undefined) await this.start(options)
    const shouldBatch = Array.isArray(content);
    const contents = shouldBatch ? content : [{ ...content, output, selector }];
    try {
      const screenshots: Array<Screenshot> = await Promise.all(
        contents.map((content) => {
          const { output, selector: contentSelector, ...pageContent } = content;
          return this.#cluster.execute(
            {
              html,
              encoding,
              transparent,
              output,
              content: pageContent,
              selector: contentSelector ? contentSelector : selector,
              type,
              quality,
            },
            async ({ page, data }) => {
              const screenshot = await makeScreenshot(page, {
                ...options,
                screenshot: new Screenshot(data),
              });
              await page.close()
              return screenshot;
            }
          );
        })
      );
      await this.#cluster.idle();
      // await cluster.close();
  
      return shouldBatch
        ? screenshots.map(({ buffer }) => buffer)
        : screenshots[0].buffer;
    } catch (err) {
      console.error(err);
      await this.#cluster.close();
      process.exit(1);
    }
  }

  async stop() {
    if (this.#cluster == undefined) return
    await this.#cluster.close()
  }
}

/*export async function nodeHtmlToImage(options: Options) {
  const {
    html,
    encoding,
    transparent,
    content,
    output,
    selector,
    type,
    quality,
    puppeteerArgs = {},
    timeout = 30000,
    puppeteer = undefined,
  } = options;

  const cluster: Cluster<ScreenshotParams> = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 2,
    timeout,
    puppeteerOptions: { ...puppeteerArgs, headless: 'new' },
    puppeteer: puppeteer,
  });

  const shouldBatch = Array.isArray(content);
  const contents = shouldBatch ? content : [{ ...content, output, selector }];

  try {
    const screenshots: Array<Screenshot> = await Promise.all(
      contents.map((content) => {
        const { output, selector: contentSelector, ...pageContent } = content;
        return cluster.execute(
          {
            html,
            encoding,
            transparent,
            output,
            content: pageContent,
            selector: contentSelector ? contentSelector : selector,
            type,
            quality,
          },
          async ({ page, data }) => {
            const screenshot = await makeScreenshot(page, {
              ...options,
              screenshot: new Screenshot(data),
            });
            await page.close()
            return screenshot;
          }
        );
      })
    );
    await cluster.idle();
    // await cluster.close();

    return shouldBatch
      ? screenshots.map(({ buffer }) => buffer)
      : screenshots[0].buffer;
  } catch (err) {
    console.error(err);
    await cluster.close();
    process.exit(1);
  }
}*/
