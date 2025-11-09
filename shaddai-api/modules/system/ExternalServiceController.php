<?php

class ExternalServiceController {
    
    public function getVerseOfTheDay() {
        
        $url = 'https://www.biblegateway.com/votd/get/?format=json&version=RVR1960';

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200 && $response) {
            header('Content-Type: application/json');
            echo $response;
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'No se pudo conectar con BibleGateway']);
        }
        exit;
    }
}