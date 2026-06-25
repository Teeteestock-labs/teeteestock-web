import 'dotenv/config';

async function testToken() {
  const token = process.env.TWITTER_BEARER_TOKEN;
  console.log("Token length:", token?.length);
  console.log("Token starts with:", token?.substring(0, 30));

  try {
    const res = await fetch('https://api.twitter.com/2/users/by/username/sakuramiko35', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Data:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

testToken();
