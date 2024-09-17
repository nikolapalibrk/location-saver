import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Define types for the street and API response
interface Street {
  name: string;
}

interface ApiResponse {
  streets: Street[];
  lastParked: string | null;
}

const App: React.FC = () => {
  const [streets, setStreets] = useState<Street[]>([]);
  const [lastParked, setLastParked] = useState<string | null>(null);

  // Fetch streets and last parked street from the API
  useEffect(() => {
    axios.get<ApiResponse>('/.netlify/functions/getStreets')  // Updated path
      .then((response) => {
        setStreets(response.data.streets);
        setLastParked(response.data.lastParked);
      })
      .catch((error) => console.error('Error fetching streets:', error));
  }, []);

  // Handle click to set last parked street
  const handleStreetClick = (street: string) => {
    axios.post('/.netlify/functions/parkStreet', { street })  // Updated path
      .then(() => {
        setLastParked(street);
      })
      .catch((error) => console.error('Error marking street:', error));
  };

  return (
    <div>
      <h1>Where's my car parked?</h1>
      <ul>
        {streets.map((street, index) => (
          <li
            key={index}
            onClick={() => handleStreetClick(street.name)}
            style={{ fontWeight: street.name === lastParked ? 'bold' : 'normal' }}
          >
            {street.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
