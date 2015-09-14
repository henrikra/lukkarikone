<?php
require_once('api-key.php'); // make file where your api key is in variable $myApiKey
date_default_timezone_set('Europe/Helsinki');
class EuroDateTime extends DateTime {
	// Override "modify()"
	public function modify($string) {
		// Change the modifier string if needed
		if ( $this->format('N') == 7 ) { // It's Sunday and we're calculating a day using relative weeks
			$matches = array();
			$pattern = '/this week|next week|previous week|last week/i';
			if ( preg_match( $pattern, $string, $matches )) {
				$string = str_replace($matches[0], '-7 days '.$matches[0], $string);
			}
		}
		return parent::modify($string);
	}
}
$dateFormat = "Y-m-d\TH:i";
$startOfWeek = new EuroDateTime();
$endOfWeek = new EuroDateTime();
$startOfWeek->modify('this week +'.$_POST["weekOffSet"].' weeks')->setTime(0, 0);
$endOfWeek->modify('this week +'.$_POST["weekOffSet"].' weeks')->setTime(23, 59);
$endOfWeek->modify('this week +6 days');
$query= '{
	"startDate":"'.$startOfWeek->format($dateFormat).'",
	"endDate":"'.$endOfWeek->format($dateFormat).'",
	"studentGroup":["'.$_POST["studentGroup"].'"]
}';
$url = 'https://opendata.metropolia.fi/r1/reservation/search';
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