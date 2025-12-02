<?php

class ExternalServiceController {
    
    public function getVerseOfTheDay() {
        
        $url = 'https://www.biblegateway.com/votd/get/?format=json&version=RVR1960';

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        curl_setopt($ch, CURLOPT_USERAGENT, 'ShaddaiMedicalSystem/1.0');
        
        // Tiempo de espera para que no se cuelgue si BibleGateway tarda
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch); // Capturamos error por si acaso
        curl_close($ch);

        if ($httpCode === 200 && $response) {
            header('Content-Type: application/json');
            
            // 1. Decodificamos el JSON original
            $data = json_decode($response, true);
            
            if (isset($data['votd']['text'])) {
                // 2. Decodificamos entidades HTML (arregla acentos y símbolos)
                $cleanText = html_entity_decode($data['votd']['text'], ENT_QUOTES | ENT_HTML5, 'UTF-8');
                
                // 3. Removemos tags HTML residuales
                $cleanText = strip_tags($cleanText);
                
                // 4. Asignamos el texto limpio de vuelta
                $data['votd']['text'] = $cleanText;
            }
            
            // Enviamos el JSON limpio
            echo json_encode($data);
        } else {
            // Manejo de errores
            http_response_code(500);
            error_log("Error BibleGateway: HTTP $httpCode - $curlError");
            echo json_encode([
                'error' => 'No se pudo conectar con BibleGateway.',
                'details' => $curlError ? $curlError : "HTTP Code: $httpCode"
            ]);
        }
        exit;
    }
}