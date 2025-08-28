<?php
// Set the content type to JSON for the response
header('Content-Type: application/json');

// 1. DATABASE CREDENTIALS (REPLACE WITH YOURS)
$servername = "your_db_host"; // e.g., "localhost"
$dbname     = "your_db_name";
$username   = "your_db_user";
$password   = "your_db_password";

// Create a response array
$response = array('success' => false, 'message' => '');

// 2. CHECK IF THE REQUEST METHOD IS POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // 3. ESTABLISH DATABASE CONNECTION
    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check connection
    if ($conn->connect_error) {
        $response['message'] = "Connection failed: " . $conn->connect_error;
        echo json_encode($response);
        exit();
    }

    // 4. PREPARE AN SQL STATEMENT TO PREVENT SQL INJECTION
    // The '?' are placeholders
    $stmt = $conn->prepare("INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)");
    
    // Bind the form data to the placeholders
    // "ssss" means all four parameters are strings
    $stmt->bind_param("ssss", $name, $email, $phone, $message);

    // 5. SANITIZE AND ASSIGN FORM DATA
    $name = htmlspecialchars(strip_tags($_POST['name']));
    $email = htmlspecialchars(strip_tags($_POST['email']));
    $phone = htmlspecialchars(strip_tags($_POST['phone']));
    $message = htmlspecialchars(strip_tags($_POST['message']));

    // 6. EXECUTE THE STATEMENT AND SEND RESPONSE
    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = "New record created successfully";
    } else {
        $response['message'] = "Error: " . $stmt->error;
    }

    // 7. CLOSE CONNECTIONS
    $stmt->close();
    $conn->close();

} else {
    $response['message'] = "Invalid request method.";
}

// 8. ECHO THE JSON RESPONSE
echo json_encode($response);
?>