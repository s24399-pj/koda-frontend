export const translations = {
    fuelType: {
      "PETROL": "Benzyna",
      "DIESEL": "Diesel",
      "LPG": "LPG",
      "HYBRID": "Hybryda",
      "ELECTRIC": "Elektryczny",
      "HYDROGEN": "Wodór",
      "OTHER": "Inne"
    },

    transmissionType: {
      "MANUAL": "Manualna",
      "AUTOMATIC": "Automatyczna",
      "SEMI_AUTOMATIC": "Półautomatyczna"
    },
  
    bodyType: {
      "SEDAN": "Sedan",
      "HATCHBACK": "Hatchback",
      "ESTATE": "Kombi",
      "SUV": "SUV",
      "COUPE": "Coupe",
      "CONVERTIBLE": "Kabriolet",
      "PICKUP": "Pickup",
      "VAN": "Van",
      "MINIBUS": "Minibus",
      "OTHER": "Inne"
    },

    driveType: {
      "FRONT_WHEEL_DRIVE": "Napęd na przednią oś",
      "REAR_WHEEL_DRIVE": "Napęd na tylną oś",
      "ALL_WHEEL_DRIVE": "Napęd na wszystkie koła",
      "FOUR_WHEEL_DRIVE": "Napęd 4x4",
      "OTHER": "Inny"
    },
  
    vehicleCondition: {
      "NEW": "Nowy",
      "USED": "Używany",
      "DAMAGED": "Uszkodzony",
      "FOR_PARTS": "Na części",
      "RESTORED": "Odrestaurowany",
      "CLASSIC": "Klasyczny"
    },
      equipment: {
      // Komfort
      "airConditioning": "Klimatyzacja",
      "automaticClimate": "Klimatyzacja automatyczna",
      "heatedSeats": "Podgrzewane fotele",
      "electricSeats": "Elektryczna regulacja foteli",
      "leatherSeats": "Tapicerka skórzana",
      "panoramicRoof": "Dach panoramiczny",
      "electricWindows": "Elektryczne szyby",
      "electricMirrors": "Elektrycznie sterowane lusterka",
      "keylessEntry": "Bezkluczykowy dostęp",
      "wheelHeating": "Podgrzewana kierownica",
      
      // Multimedia
      "navigationSystem": "System nawigacji",
      "bluetooth": "Bluetooth",
      "usbPort": "Port USB",
      "multifunction": "Kierownica wielofunkcyjna",
      "androidAuto": "Android Auto",
      "appleCarPlay": "Apple CarPlay",
      "soundSystem": "System audio premium",
      
      // Systemy wspomagające
      "parkingSensors": "Czujniki parkowania",
      "rearCamera": "Kamera cofania",
      "cruiseControl": "Tempomat",
      "adaptiveCruiseControl": "Tempomat adaptacyjny",
      "laneAssist": "Asystent pasa ruchu",
      "blindSpotDetection": "Monitoring martwego pola",
      "emergencyBraking": "System awaryjnego hamowania",
      "startStop": "System start-stop",
      
      // Oświetlenie
      "xenonLights": "Reflektory ksenonowe",
      "ledLights": "Reflektory LED",
      "ambientLighting": "Oświetlenie ambient",
      "automaticLights": "Automatyczne światła",
      "adaptiveLights": "Adaptacyjne reflektory",
      
      // Dodatkowe funkcje
      "heatedSteeringWheel": "Podgrzewana kierownica",
      "electricTrunk": "Elektrycznie otwierana klapa bagażnika",
      "electricSunBlind": "Elektryczna roleta przeciwsłoneczna",
      "headUpDisplay": "Wyświetlacz HUD",
      "aromatherapy": "Aromaterapia"
    },
  
    offerFields: {
      "title": "Tytuł",
      "description": "Opis",
      "price": "Cena",
      "currency": "Waluta",
      "negotiable": "Do negocjacji",
      
      // Informacje kontaktowe
      "location": "Lokalizacja",
      "contactPhone": "Telefon kontaktowy",
      "contactEmail": "Email kontaktowy",
      "expirationDate": "Data ważności",
      
      // Szczegóły pojazdu
      "brand": "Marka",
      "model": "Model",
      "year": "Rok produkcji",
      "color": "Kolor",
      "displacement": "Pojemność silnika",
      "vin": "Numer VIN",
      "mileage": "Przebieg",
      "fuelType": "Rodzaj paliwa",
      "transmission": "Skrzynia biegów",
      "bodyType": "Typ nadwozia",
      "driveType": "Napęd",
      "enginePower": "Moc silnika",
      "doors": "Liczba drzwi",
      "seats": "Liczba miejsc",
      "condition": "Stan",
      "registrationNumber": "Numer rejestracyjny",
      "registrationCountry": "Kraj rejestracji",
      "firstOwner": "Pierwszy właściciel",
      "accidentFree": "Bezwypadkowy",
      "serviceHistory": "Historia serwisowa",
      "additionalFeatures": "Dodatkowe wyposażenie",
      "equipment": "Wyposażenie"
    }
  };
  
  // Use case:
  // const polishFuelType = translations.fuelType[FuelType.PETROL]; // "Benzyna"
  // const polishEquipmentName = translations.equipment["airConditioning"]; // "Klimatyzacja"