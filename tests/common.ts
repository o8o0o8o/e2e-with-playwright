import { Page, expect, test } from "@playwright/test";
const BASE_TEST_PATH = `/`;

export type StepsBeforeSnapshotArgs = { page: Page };

type StepsBeforeSnapshot = ({ page }: StepsBeforeSnapshotArgs) => Promise<void>;

type DiffSlugs = {
  master: string;
  test: string;
};

type Slug = string | DiffSlugs;

type TestSuite = {
  slug: Slug;
  stepsBeforeSnapshot?: StepsBeforeSnapshot;
};

type Test = TestSuite | string;

function isTestSuite(test: any): test is TestSuite {
  return typeof test === "object" && "slug" in test;
}

const applyScreenshotTemplate = ({
  slug,
  stepsBeforeSnapshot,
  diffSlugs,
}: {
  slug: string;
  stepsBeforeSnapshot?: StepsBeforeSnapshot;
  diffSlugs?: DiffSlugs;
}) => {
  return {
    description: `Test for the ${slug.split("/")[1] || slug} component`,
    path: BASE_TEST_PATH + slug,
    screenshot: `${slug}.png`,
    html: `${slug}.html`,
    stepsBeforeSnapshot,
    diffSlugs,
  };
};

const getDiffSlugs = (slug: Slug) => {
  if (typeof slug === "string") {
    return;
  }
  return {
    master: BASE_TEST_PATH + slug.master,
    test: BASE_TEST_PATH + slug.test,
  };
};

const constructString = (slug: DiffSlugs) => {
  const findCommonPart = (str1: string, str2: string) => {
    let commonPart = "";
    const length = str1.length > str2.length ? str1.length : str2.length;
    for (let i = 0; i < length - 1; i++) {
      if (str1[i] == str2[i]) {
        commonPart += str1[i];
      } else {
        break;
      }
    }
    return commonPart;
  };
  const commonPart = findCommonPart(slug.master, slug.test);
  const master = slug.master.replace(commonPart, "");
  const test = slug.test.replace(commonPart, "");
  return `${master}VS${test}`;
};

const generateScreenshotTests = (tests: Test[]) =>
  tests.map((test) => {
    if (isTestSuite(test)) {
      return applyScreenshotTemplate({
        slug:
          typeof test.slug === "string"
            ? test.slug
            : constructString(test.slug),
        stepsBeforeSnapshot: test.stepsBeforeSnapshot,
        diffSlugs: getDiffSlugs(test.slug),
      });
    }
    return applyScreenshotTemplate({ slug: test });
  });

export async function runScreenshotTests(testSlugs: Test[]) {
  const screenshotTests = generateScreenshotTests(testSlugs);
  for (const screenshotTest of screenshotTests) {
    test(screenshotTest.description, async ({ page, context }, testInfo) => {
      let actualPath = screenshotTest.path;
      if (screenshotTest.diffSlugs) {
        if (process.env.IS_E2E_SEED) {
          actualPath = screenshotTest.diffSlugs.master;
        } else {
          actualPath = screenshotTest.diffSlugs.test;
        }
      }
      await page.goto(actualPath);
      const images = await page.locator("img:visible").all();
      await page.waitForLoadState("load");
      await page.waitForLoadState("domcontentloaded");
      if (images.length) {
        for (const img of images) {
          await img.scrollIntoViewIfNeeded();
          await expect(img).toHaveJSProperty("complete", true);
          await expect(img).not.toHaveJSProperty("naturalWidth", 0);
          await expect(img).toBeVisible();
          await expect(img).toBeAttached();
        }
        if (process.env.IS_E2E_SEED) {
          await page.waitForTimeout(4000);
        }
      }
      if (screenshotTest.stepsBeforeSnapshot) {
        await screenshotTest.stepsBeforeSnapshot({ page });
      }
      await expect(page).toHaveScreenshot({ fullPage: true });
    });
  }
}
