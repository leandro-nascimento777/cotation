// Renderiza HTML -> PDF via Chromium headless (Puppeteer).
//
// Dois caminhos, escolhidos em runtime:
// - Produção/serverless (Vercel, AWS Lambda): usa `puppeteer-core` +
//   `@sparticuz/chromium` — um build de Chromium enxuto e com as libs
//   nativas já vinculadas estaticamente, feito pra rodar dentro do runtime
//   restrito de uma function serverless (sem apt/system libs disponíveis).
// - Local (dev/build na sua máquina): usa o pacote `puppeteer` completo, que
//   já baixa um Chromium compatível com o seu SO na instalação.
//
// É por isso que o app agora funciona na Vercel: diferente do pipeline
// Python/WeasyPrint anterior, o Chromium do @sparticuz/chromium roda dentro
// dos limites de uma Vercel Function.
export async function renderHtmlToPdf(html: string): Promise<Buffer> {
  const isServerless = Boolean(
    process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT
  );

  if (isServerless) {
    const { default: chromium } = await import("@sparticuz/chromium");
    const puppeteer = await import("puppeteer-core");
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
    try {
      return await printPdf(browser, html);
    } finally {
      await browser.close();
    }
  }

  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.launch({ headless: true });
  try {
    return await printPdf(browser, html);
  } finally {
    await browser.close();
  }
}

// `puppeteer` e `puppeteer-core` exportam classes de Browser/Page
// estruturalmente equivalentes mas nominalmente distintas (uma reexporta a
// outra internamente com pequenas diferenças de tipos). Como só usamos um
// subconjunto mínimo da API aqui, tipamos frouxamente em vez de tentar unir
// os dois tipos exatos dos dois pacotes.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function printPdf(browser: any, html: string): Promise<Buffer> {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "15mm", right: "15mm", bottom: "15mm", left: "15mm" },
  });
  return Buffer.from(pdf);
}
