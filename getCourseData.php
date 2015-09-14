<?php
require_once('api-key.php'); // make file where your api key is in variable $myApiKey
$query= '{
	"codes":["'.$_POST["codes"].'"]
}';
$url = 'https://opendata.metropolia.fi/r1/realization/search';
$apiKey= $myApiKey . ':'; // required ':' after the api-key
$session = curl_init($url); // set up session
curl_setopt($session, CURLOPT_USERPWD, $apiKey); // authentication
curl_setopt($session, CURLOPT_POSTFIELDS, $query); // add query entries
curl_setopt($session, CURLOPT_SSL_VERIFYPEER, false); // skips verification if certificates cause problems
curl_setopt($session, CURLOPT_RETURNTRANSFER, true); // returns data as string
$response = curl_exec($session); // execute and get response
curl_close($session); //close session
echo $response;
?>