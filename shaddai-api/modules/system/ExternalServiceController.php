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
            
            // 1. Decodificamos el JSON original
            $data = json_decode($response, true);
            
            if (isset($data['votd']['text'])) {
                // 2. Decodificamos entidades HTML en el servidor
                $cleanText = html_entity_decode($data['votd']['text'], ENT_QUOTES | ENT_HTML5, 'UTF-8');
                // 3. Removemos tags HTML
                $cleanText = strip_tags($cleanText);
                // 4. Asignamos de vuelta
                $data['votd']['text'] = $cleanText;
            }
            
            // Enviamos el JSON limpio
            echo json_encode($data);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'No se pudo conectar con BibleGateway']);
        }
        exit;
    }
}