const key = "b5d5ed2f4bmsh63fb01b6d8b3bc7p1dddbbjsn08ffa5ec09e8";

async function testHost(host) {
  try {
    const url = `https://${host}/custom_ad/searchByAddress?propertyStatus=For_Sale&location=Miami,FL`;
    console.log(`Testing ${url}`);
    const res = await fetch(url, {
      headers: {
        'x-rapidapi-host': host,
        'x-rapidapi-key': key
      }
    });
    console.log(`Status for ${host}: ${res.status}`);
    if (res.status === 200) {
      const data = await res.json();
      console.log(`Success with ${host}! Keys:`, Object.keys(data));
      return true;
    }
  } catch (e) {
    console.log(`Failed for ${host}:`, e.message);
  }
  return false;
}

async function run() {
  await testHost('private-zillow.p.rapidapi.com');
}

run();
