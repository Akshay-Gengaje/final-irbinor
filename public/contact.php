<?php
// Set the content type of the response to JSON
header('Content-Type: application/json');

// --- Step 1: Securely Include Database Credentials ---
// This line assumes 'db_config.php' is one directory *above* your public_html folder.
// For example, if contact.php is in /public_html/, db_config.php should be in the root directory just above it.
require_once __DIR__ . '/../web_config/db_config.php';

// Create a response array
$response = [];

// Check if the request method is POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // --- Data Validation ---
    $name = trim($_POST['name']);
    $email = trim($_POST['email']);
    $message = trim($_POST['message']);
    
    if (empty($name) || empty($email) || empty($message)) {
        $response['success'] = false;
        $response['message'] = 'Please fill in all fields.';
        echo json_encode($response);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response['success'] = false;
        $response['message'] = 'Invalid email format.';
        echo json_encode($response);
        exit;
    }

    // --- Database Connection ---
    // Now use the constants defined in your config file
    try {
        $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
    } catch (Exception $e) {
        $response['success'] = false;
        $response['message'] = 'Database connection failed. Please contact support.';
        // In a real production environment, you would log this error instead of showing it to the user.
        // error_log('Database Connection Error: ' . $e->getMessage());
        echo json_encode($response);
        exit;
    }
    
    // Check connection
    if ($conn->connect_error) {
        $response['success'] = false;
        $response['message'] = 'Database connection failed. Please contact support.';
        // error_log('MySQLi Connection Error: ' . $conn->connect_error);
        echo json_encode($response);
        exit;
    }

    // --- Prepare and Execute SQL Statement (to prevent SQL injection) ---
    // Make sure you have a table named 'contacts' with columns: id, name, email, message, submission_date
    $sql = "INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    
    if ($stmt === false) {
        $response['success'] = false;
        $response['message'] = 'Failed to prepare the database query.';
        // error_log('MySQLi Prepare Error: ' . $conn->error);
        echo json_encode($response);
        exit;
    }
    
    // Bind parameters: 'sss' means three string parameters
    $stmt->bind_param("sss", $name, $email, $message);
    
    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'Message sent successfully!';
    } else {
        $response['success'] = false;
        $response['message'] = 'Failed to send message. Please try again later.';
        // error_log('MySQLi Execute Error: ' . $stmt->error);
    }
    
    // Close the statement and connection
    $stmt->close();
    $conn->close();

} else {
    // If not a POST request, send an error
    $response['success'] = false;
    $response['message'] = 'Invalid request method.';
}

// Send the JSON response back to the JavaScript
echo json_encode($response);
?>

