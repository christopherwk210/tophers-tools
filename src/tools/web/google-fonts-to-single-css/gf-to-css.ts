export async function googleFontLinkToSingleCSS(input: string): Promise<{ success: boolean; value: string; }> {
  const result = await fetch(input).catch(() => {});
  if (!result) return { success: false, value: 'Failed to fetch the URL!' };

  const text = await result.text().catch(() => {});
  if (!text) return { success: false, value: 'Failed to read the response from the URL!' };

  const urls = text.match(/url\(([^)]+)\)/g);
  if (!urls) return { success: false, value: 'Failed to find any URLs in the response!' };

  const promises = urls.map(async (url) => {
    const match = url.match(/url\(([^)]+)\)/)!;
    const foundUrl = match[1];
    const extension = foundUrl.split('.').pop();
    // if (extension !== 'woff2') return 'data:font/woff2;charset=utf-8;base64,';
    const response = await fetch(foundUrl);
    const bytes = await response.blob();
    const base64 = bytes.arrayBuffer().then((buffer) => {
      let binary = '';
      const bytes = new Uint8Array(buffer);
      bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
      });
      return [btoa(binary), extension];
    });
    return base64
  });

  const base64s = await Promise.all(promises).catch(() => {});
  if (!base64s) return { success: false, value: 'Failed to convert some URLs to base64!' };

  // Replace all URLs with base64 data
  let newText = text;
  base64s.forEach(([base64, extension], i) => {
    newText = newText.replace(urls[i], `url('data:font/${extension};charset=utf-8;base64,${base64}')`);
  });

  return { success: true, value: newText };
}