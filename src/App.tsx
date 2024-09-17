import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import axios from 'axios';

interface Street {
  name: string;
  order: number;
}

interface ApiResponse {
  streets: Street[];
  lastParked: string | null;
  date: string;
}

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [currentCardClicked, setCurrentlyClicked] = useState<null | string>(null);
  const [lastParked, setLastParked] = useState<string | null>(null);
  const [parkingDate, setParkingDate] = useState<string>('');
  const toast = useRef<Toast>(null);

  const streets = [
    'sarajevska do zgrade',
    'sarajevska nasa strana',
    'sarajevska preko puta',
    'vojvode milenka donji deo',
    'vojvode milenka gornji deo',
    'milosa pocerca donji deo',
    'milosa pocerca gornji deo',
    'savska pre palate',
    'savska ispred palate',
    'savska posle palate',
    'risanska donji deo',
    'risanska gornji deo',
    'aleksandra kostica',
    'garaza'
  ];

  useEffect(() => {
    axios.get<ApiResponse>('/.netlify/functions/getStreets')
      .then((response) => {
        setLastParked(response.data.lastParked);
        setParkingDate(response.data.date);
      })
      .catch((error) => {
        console.error('Error fetching streets:', error);
        toast.current?.show({severity:'error', summary: 'Error', detail:'Failed to fetch location', life: 3000});
      });
  }, []);

  function openModal(streetName: string) {
    setCurrentlyClicked(streetName);
    setIsVisible(true);
  }

  const handleStreetClick = (street: string) => {
    if (loading) return;
    setLoading(true);
    axios.post('/.netlify/functions/parkStreet', { street })
      .then(() => {
        setLastParked(street);
        setParkingDate((new Date()).toISOString());
        toast.current?.show({severity:'success', summary: 'Success', detail:`Car location set to ${street}`, life: 3000});
      })
      .catch((error) => {
        console.error('Error marking street:', error);
        toast.current?.show({severity:'error', summary: 'Error', detail:'Failed to update location', life: 3000});
      })
      .finally(() => {
        setLoading(false);
        setIsVisible(false);
      });
  };

  const today = new Date();
  const formattedDate = parkingDate ? new Date(parkingDate) : null;

  return (
    <div className="app-container">
      <Toast ref={toast} />
      <Dialog
        style={{maxWidth: '92vw'}}
        visible={isVisible} 
        onHide={() => setIsVisible(false)}
        header="Are you sure?"
        footer={
          <div className="dialog-footer">
            <Button label="Cancel" icon="pi pi-times" onClick={() => setIsVisible(false)} className="p-button-text" />
            <Button label="Confirm" icon="pi pi-check" onClick={() => handleStreetClick(currentCardClicked!)} loading={loading} />
          </div>
        }
      >
        <p>Are you sure you want to set your car location to {currentCardClicked}?</p>
      </Dialog>
      <div className="content-wrapper">
        <h1 className="app-title">
          <i className="pi pi-car"></i> Parking Mazda
        </h1>
        {!lastParked ? (
          <ProgressSpinner/>
        ) : (
          <>
            <div className="street-grid">
              {streets.map((street) => (
                <Card 
                  key={street} 
                  className={`street-card ${lastParked === street ? 'selected' : ''}`}
                  onClick={() => openModal(street)}
                >
                  <div className="street-card-content">
                    <span className="street-name">{street}</span>
                    {lastParked === street && <i className="pi pi-map-marker"></i>}
                  </div>
                </Card>
              ))}
            </div>
            <div className="info-panel">
              <div className="info-section">
                <h3>Today:</h3>
                <p>{today.toLocaleDateString()} {today.toLocaleTimeString()}</p>
              </div>
              <div className="info-section">
                <h3>Parked:</h3>
                <p>{formattedDate?.toLocaleDateString()} {formattedDate?.toLocaleTimeString()}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;   