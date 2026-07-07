async function main() {
  console.log("=== Triggering Matching Engine ===");
  try {
    const res = await fetch("http://localhost:3000/api/matching", {
      method: "POST"
    });
    const data = await res.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Failed to fetch matching API:", err);
  }
}

main();
