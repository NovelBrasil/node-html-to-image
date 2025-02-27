/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Page, PuppeteerLifeCycleEvent, PuppeteerNodeLaunchOptions } from "puppeteer";
import type { Screenshot } from "./models/Screenshot";

export type Content = Array<{ output: string; selector?: string }> | object;
export type Encoding = "base64" | "binary";
export type ImageType = "png" | "jpeg";

export interface ScreenshotParams {
  html: string;
  encoding?: Encoding;
  transparent?: boolean;
  type?: ImageType;
  quality?: number;
  selector?: string;
  content?: Content;
  output?: string;
}

export interface StartOptions {
  puppeteerArgs?: PuppeteerNodeLaunchOptions;
  // https://github.com/thomasdondorf/puppeteer-cluster/blob/b5b098aed84b8d2c170b3f9d0ac050f53582df45/src/Cluster.ts#L30
  puppeteer?: any,
  timeout?: number
}

export interface Options extends ScreenshotParams, StartOptions {
  waitUntil?: PuppeteerLifeCycleEvent | PuppeteerLifeCycleEvent[];
  beforeScreenshot?: (page: Page) => void;
}

export interface MakeScreenshotParams {
  screenshot: Screenshot;
  waitUntil?: PuppeteerLifeCycleEvent | PuppeteerLifeCycleEvent[];
  beforeScreenshot?: (page: Page) => void;
  handlebarsHelpers?: { [helpers: string]: (...args: any[]) => any };

  timeout?: number
}
