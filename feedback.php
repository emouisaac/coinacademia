<?php
if (isset($_GET['submit'])) {
    $name = $_GET['name'];
    $mailForm = $_GET['email'];
    $subject = $_GET['subject'];
    $message = $_GET['message'];

    $mailTo = "info@coinacademia.in";
    $headers = "From: ".$mailForm;
    $txt = "You have received an e-mail from ".$name.".\n\n".$message;

    mail($mailTo, $subject, $txt, $headers);
    header("Location: index.php?mailsent=true");
}
?>
<!DOCTYPE html>
