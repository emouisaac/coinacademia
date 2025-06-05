<?php
$name = $_POST['name'] ?? '';
$visitor_email= $_POST['email'] ?? '';
$subject = $_POST['subject'] ?? '';
$message = $_POST['message'] ?? '';


$email_from = 'info@coinacademia.in'; // Replace with your email address
$email_subject = "New Form Submission: $subject";
$email_body = "You have received a new message from the user $name.\n".
              "Here are the details:\n".
              "Name: $name\n".
              "Email: $visitor_email\n".
              "Subject: $subject\n".
              "Message: $message\n";
$to = 'emouisaac1@gmail.com'; // Replace with your email address
$headers = "From: $email_from\r\n";
$headers .= "Reply-To: $visitor_email\r\n";
mail($to, $email_subject, $email_body, $headers);
// Check if the form fields are empty
header("Location: ../index.html"); // Redirect to the homepage after submission


?>
