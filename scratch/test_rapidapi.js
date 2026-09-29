const key = "b5d5ed2f4bmsh63fb01b6d8b3bc7p1dddbbjsn08ffa5ec09e8";

async function testHost(host, path) {
  try {
    const res = await fetch(`https://${host}${path}`, {
      headers: {
        'x-rapidapi-host': host,
        'x-rapidapi-key': key
      }
    });
    console.log(`Testing ${host}: ${res.status}`);
    if (res.status === 200) {
      const data = await res.json();
      console.log(`Success with ${host}! Keys:`, Object.keys(data).slice(0, 5));
      return true;
    }
  } catch (e) {
    console.log(`Failed for ${host}:`, e.message);
  }
  return false;
}

async function run() {
  // Common endpoints to test search by address or location
  await testHost('zillow-com1.p.rapidapi.com', '/propertyExtendedSearch?location=Los Angeles, CA');
  await testHost('zillow56.p.rapidapi.com', '/search?location=Los Angeles, CA');
  await testHost('private-zillow.p.rapidapi.com', '/custom_a/byaddress?address=Los Angeles, CA');
}

run();
