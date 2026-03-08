document.getElementById('unifiedLoginForm').addEventListener('submit', function(event) {
    event.preventDefault(); 

    // Retrieve the selected user role
    const userType = document.getElementById('userType').value; 
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Check if a role was selected
    if (!userType) {
        alert('Please select whether you are a Student or a Teacher.');
        return;
    }

    // Check if email and password were provided
    if (email && password) {
        console.log(`Login attempt for Role: ${userType}`, { email: email, password: password });
        
        // --- DEMO LOGIC (Server-side logic would go here) ---
        
        // Example of directing the user based on their role
        if (userType === 'Student') {
            alert('Student Login successful! Redirecting to Student Dashboard...');
            // window.location.href = '/student-dashboard.html';
        } else if (userType === 'Teacher') {
            alert('Teacher Login successful! Redirecting to Teacher Portal...');
            // window.location.href = '/teacher-portal.html';
        }

    } else {
        alert('Please enter your email and password.');
    }
});