async function run() {
  const formData = new FormData();
  formData.append('resume', new Blob(['My dummy resume text'], { type: 'text/plain' }), 'resume.txt');
  
  try {
    const res = await fetch('http://localhost:3000/api/v1/resume/test', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    console.log("Success:", data);
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}
run();
