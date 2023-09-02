const host = 'api.tinify.com';

export async function compress(apiKey: string, file: File) {
  const result = await fetch(`https://${host}/shrink`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`api:${apiKey}`)}`
    }
  })

  console.log(result);
}