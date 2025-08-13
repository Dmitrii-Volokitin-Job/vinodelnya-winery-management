// Simple script to test authentication from the frontend
console.log('=== Auth Debug Test ===');

// Test direct API call
fetch('http://localhost:8081/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin'
  })
})
.then(response => response.json())
.then(data => {
  console.log('✅ Login successful:', data);
  
  // Test API call with the token
  return fetch('http://localhost:8081/api/v1/entries', {
    headers: {
      'Authorization': `Bearer ${data.accessToken}`
    }
  });
})
.then(response => {
  console.log('📊 Entries API status:', response.status);
  return response.json();
})
.then(data => {
  console.log('✅ Entries data received:', data.content?.length, 'entries');
})
.catch(error => {
  console.error('❌ Test failed:', error);
});