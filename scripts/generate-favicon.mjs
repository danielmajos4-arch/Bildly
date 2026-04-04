/**
 * Builds a high-visibility favicon: trims transparency, maximizes logo in frame,
 * gamma + saturation + sharpen tuned for tiny tab previews.
 */
import sharp from "sharp";
import { execSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const src = join(root, "public", "Bidly__3_-removebg-preview.png");
const outPng = join(root, "public", "bidly-favicon.png");
const outIco = join(root, "public", "favicon.ico");

const SIZE = 512;

const pipeline = sharp(src)
  .trim({ threshold: 12 })
  .resize(SIZE, SIZE, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
    kernel: sharp.kernel.lanczos3,
  })
  // Punch for tiny tab sizes: lift mids slightly, richer color, crisper edges
  .gamma(1.06)
  .modulate({ brightness: 1.16, saturation: 1.38 })
  .sharpen({ sigma: 1.25, m1: 1.15, m2: 3.2 })
  .png({ compressionLevel: 9 });

await pipeline.toFile(outPng);

execSync(`npx --yes png-to-ico "${outPng}" > "${outIco}"`, {
  cwd: root,
  stdio: "inherit",
});

console.log("Wrote", outPng, "and", outIco);
