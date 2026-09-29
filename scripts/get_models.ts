const apiKey = process.env.GROQ_API_KEY;
async function getModels() {
  const res = await fetch('https://api.groq.com/openai/v1/models', {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  const data = await res.json();
  console.log(data.data.map((m: any) => m.id));
}
getModels();
