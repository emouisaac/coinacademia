<?php
    $name = $_POST['name'];
    $mailForm = $_POST['email'];
    $subject = $_POST['subject'];
    $message = $_POST['message'];

    $email_from = 'info@coinacademia.in';
    $email_subject = "You have received an e-mail from ";
    $email_body = "User Name: $name.\n".
                    "User Email: $mailForm.\n".
                    "User Subject: $subject.\n".
                    "User Message: $message.\n";
    
    $to = "admin@coinacademia.in";
    $headers = "From: ".$email_from."\r\n";
    $headers .= "Reply-To: $mailForm\r\n";

    if(mail($mailTo, $email_subject, $email_body, $headers)) {
        header("Location: HCP.html?mailsent=true");
    } else {
        header("Location: HCP.html?mailsent=false");
    }
?>
