import React, { useState, useEffect } from 'react';
import {
  FuelType,
  TransmissionType,
  BodyType,
  DriveType,
  VehicleCondition,
} from '../../types/offer/OfferTypes';
import './AdvancedFilter.scss';
import offerApiService, { AdvancedSearchParams } from '../../api/offerApi';

const enumToOptions = (enumObject: any) => {
  return Object.keys(enumObject)
    .filter(key => isNaN(Number(key)))
    .map(key => ({
      value: enumObject[key],
      label: key
        .replace(/_/g, ' ')
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
    }));
};

interface AdvancedFilterProps {
  onSearch: (results: any) => void;
  onLoading: (isLoading: boolean) => void;
}

const AdvancedFilter: React.FC<AdvancedFilterProps> = ({ onSearch, onLoading }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState<AdvancedSearchParams>({
    phrase: '',
    brand: '',
    model: '',
    minPrice: null,
    maxPrice: null,
    minYear: null,
    maxYear: null,
    minMileage: null,
    maxMileage: null,
    fuelType: null,
    transmission: null,
    bodyType: null,
    driveType: null,
    minEnginePower: null,
    maxEnginePower: null,
    condition: null,
    firstOwner: null,
    accidentFree: null,
    serviceHistory: null,

    airConditioning: null,
    automaticClimate: null,
    heatedSeats: null,
    navigationSystem: null,
    bluetooth: null,
    parkingSensors: null,
    rearCamera: null,
    leatherSeats: null,
    panoramicRoof: null,
    ledLights: null,
  });

  const fuelTypeOptions = enumToOptions(FuelType);
  const transmissionOptions = enumToOptions(TransmissionType);
  const bodyTypeOptions = enumToOptions(BodyType);
  const driveTypeOptions = enumToOptions(DriveType);
  const conditionOptions = enumToOptions(VehicleCondition);

  const popularBrands = [
    'Audi',
    'BMW',
    'Chevrolet',
    'Dacia',
    'Fiat',
    'Ford',
    'Honda',
    'Hyundai',
    'Jaguar',
    'Jeep',
    'Kia',
    'Land Rover',
    'Lexus',
    'Mazda',
    'Mercedes-Benz',
    'Mitsubishi',
    'Nissan',
    'Opel',
    'Peugeot',
    'Porsche',
    'Renault',
    'Seat',
    'Skoda',
    'Subaru',
    'Suzuki',
    'Toyota',
    'Volkswagen',
    'Volvo',
  ].sort();

  useEffect(() => {
    console.log('AdvancedFilter mounted, fetching initial offers...');
    fetchAllOffers();
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      offerApiService
        .getBrands()
        .then(brandsList => {
          if (brandsList.length > 0) {
            setBrands(brandsList);
          } else {
            setBrands(popularBrands);
          }
        })
        .catch(error => {
          console.error('Error fetching brands:', error);
          setBrands(popularBrands);
        });
    };

    fetchBrands();
  }, []);

  useEffect(() => {
    const fetchModels = async () => {
      if (!filters.brand) {
        setModels([]);
        return;
      }

      setLoading(true);

      offerApiService
        .searchBrands(filters.brand)
        .then(modelsList => {
          setModels(modelsList);
        })
        .catch(error => {
          console.error('Error fetching models:', error);
          setModels([]);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    fetchModels();
  }, [filters.brand]);

  const fetchAllOffers = () => {
    console.log('Fetching all offers...');
    onLoading(true);

    offerApiService
      .searchOffers()
      .then(response => {
        console.log('Initial offers response received');
        onSearch(response);
      })
      .catch(error => {
        console.error('Error fetching initial offers:', error);
      })
      .finally(() => {
        onLoading(false);
      });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
      setFilters(prev => ({
        ...prev,
        [name]: value === '' ? null : Number(value),
      }));
    } else if (type === 'select-one') {
      setFilters(prev => ({
        ...prev,
        [name]: value === '' ? null : value,
      }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFilters(prev => ({ ...prev, [name]: checked ? true : null }));
  };

  const searchOffers = (e: React.FormEvent) => {
    e.preventDefault();
    onLoading(true);

    offerApiService
      .searchOffers(filters)
      .then(response => {
        onSearch(response);
      })
      .finally(() => {
        onLoading(false);
      });
  };

  const resetFilters = () => {
    setFilters({
      phrase: '',
      brand: '',
      model: '',
      minPrice: null,
      maxPrice: null,
      minYear: null,
      maxYear: null,
      minMileage: null,
      maxMileage: null,
      fuelType: null,
      transmission: null,
      bodyType: null,
      driveType: null,
      minEnginePower: null,
      maxEnginePower: null,
      condition: null,
      firstOwner: null,
      accidentFree: null,
      serviceHistory: null,

      airConditioning: null,
      automaticClimate: null,
      heatedSeats: null,
      navigationSystem: null,
      bluetooth: null,
      parkingSensors: null,
      rearCamera: null,
      leatherSeats: null,
      panoramicRoof: null,
      ledLights: null,
    });

    fetchAllOffers();
  };

  const toggleAdvancedFilters = () => {
    setShowAdvanced(!showAdvanced);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== null && value !== '');

  const currentYear = new Date().getFullYear();

  return (
    <div className="advanced-filter">
      <form onSubmit={searchOffers}>
        <div className="filter-section basic-filters">
          <div className="filter-row">
            <div className="filter-field">
              <label htmlFor="phrase">Szukaj</label>
              <input
                type="text"
                id="phrase"
                name="phrase"
                placeholder="Nazwa, marka, model..."
                value={filters.phrase}
                onChange={handleInputChange}
              />
            </div>

            <div className="filter-field">
              <label htmlFor="brand">Marka</label>
              <select
                id="brand"
                name="brand"
                value={filters.brand || ''}
                onChange={handleInputChange}
              >
                <option value="">Wszystkie marki</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-field">
              <label htmlFor="model">Model</label>
              <select
                id="model"
                name="model"
                value={filters.model || ''}
                onChange={handleInputChange}
                disabled={!filters.brand || loading}
              >
                <option value="">Wszystkie modele</option>
                {models.map(model => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-row">
            <div className="filter-field range-field">
              <label>Cena (PLN)</label>
              <div className="range-inputs">
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Od"
                  min="0"
                  value={filters.minPrice === null ? '' : filters.minPrice}
                  onChange={handleInputChange}
                />
                <span className="range-separator">-</span>
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Do"
                  min="0"
                  value={filters.maxPrice === null ? '' : filters.maxPrice}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="filter-field range-field">
              <label>Rok produkcji</label>
              <div className="range-inputs">
                <input
                  type="number"
                  name="minYear"
                  placeholder="Od"
                  min="1900"
                  max={currentYear}
                  value={filters.minYear === null ? '' : filters.minYear}
                  onChange={handleInputChange}
                />
                <span className="range-separator">-</span>
                <input
                  type="number"
                  name="maxYear"
                  placeholder="Do"
                  min="1900"
                  max={currentYear}
                  value={filters.maxYear === null ? '' : filters.maxYear}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="toggle-advanced">
          <button type="button" className="toggle-button" onClick={toggleAdvancedFilters}>
            {showAdvanced ? 'Ukryj filtry zaawansowane' : 'Pokaż filtry zaawansowane'}
          </button>
        </div>

        {showAdvanced && (
          <div className="filter-section advanced-filters">
            <h3>Szczegóły pojazdu</h3>

            <div className="filter-row">
              <div className="filter-field">
                <label htmlFor="fuelType">Rodzaj paliwa</label>
                <select
                  id="fuelType"
                  name="fuelType"
                  value={filters.fuelType || ''}
                  onChange={handleInputChange}
                >
                  <option value="">Wszystkie</option>
                  {fuelTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-field">
                <label htmlFor="transmission">Skrzynia biegów</label>
                <select
                  id="transmission"
                  name="transmission"
                  value={filters.transmission || ''}
                  onChange={handleInputChange}
                >
                  <option value="">Wszystkie</option>
                  {transmissionOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-field">
                <label htmlFor="bodyType">Typ nadwozia</label>
                <select
                  id="bodyType"
                  name="bodyType"
                  value={filters.bodyType || ''}
                  onChange={handleInputChange}
                >
                  <option value="">Wszystkie</option>
                  {bodyTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filter-row">
              <div className="filter-field">
                <label htmlFor="driveType">Rodzaj napędu</label>
                <select
                  id="driveType"
                  name="driveType"
                  value={filters.driveType || ''}
                  onChange={handleInputChange}
                >
                  <option value="">Wszystkie</option>
                  {driveTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-field">
                <label htmlFor="condition">Stan pojazdu</label>
                <select
                  id="condition"
                  name="condition"
                  value={filters.condition || ''}
                  onChange={handleInputChange}
                >
                  <option value="">Wszystkie</option>
                  {conditionOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-field range-field">
                <label>Przebieg (km)</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    name="minMileage"
                    placeholder="Od"
                    min="0"
                    value={filters.minMileage === null ? '' : filters.minMileage}
                    onChange={handleInputChange}
                  />
                  <span className="range-separator">-</span>
                  <input
                    type="number"
                    name="maxMileage"
                    placeholder="Do"
                    min="0"
                    value={filters.maxMileage === null ? '' : filters.maxMileage}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="filter-row">
              <div className="filter-field range-field">
                <label>Moc silnika (KM)</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    name="minEnginePower"
                    placeholder="Od"
                    min="0"
                    value={filters.minEnginePower === null ? '' : filters.minEnginePower}
                    onChange={handleInputChange}
                  />
                  <span className="range-separator">-</span>
                  <input
                    type="number"
                    name="maxEnginePower"
                    placeholder="Do"
                    min="0"
                    value={filters.maxEnginePower === null ? '' : filters.maxEnginePower}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="filter-field checkbox-group">
                <label className="group-label">Dodatkowe informacje</label>
                <div className="checkbox-container">
                  <div className="checkbox-item">
                    <input
                      type="checkbox"
                      id="firstOwner"
                      name="firstOwner"
                      checked={filters.firstOwner === true}
                      onChange={handleCheckboxChange}
                    />
                    <label htmlFor="firstOwner">Pierwszy właściciel</label>
                  </div>

                  <div className="checkbox-item">
                    <input
                      type="checkbox"
                      id="accidentFree"
                      name="accidentFree"
                      checked={filters.accidentFree === true}
                      onChange={handleCheckboxChange}
                    />
                    <label htmlFor="accidentFree">Bezwypadkowy</label>
                  </div>

                  <div className="checkbox-item">
                    <input
                      type="checkbox"
                      id="serviceHistory"
                      name="serviceHistory"
                      checked={filters.serviceHistory === true}
                      onChange={handleCheckboxChange}
                    />
                    <label htmlFor="serviceHistory">Serwisowany</label>
                  </div>
                </div>
              </div>
            </div>

            <h3>Wyposażenie</h3>

            <div className="filter-row equipment-section">
              <div className="checkbox-column">
                <h4>Komfort</h4>
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="airConditioning"
                    name="airConditioning"
                    checked={filters.airConditioning === true}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor="airConditioning">Klimatyzacja</label>
                </div>

                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="automaticClimate"
                    name="automaticClimate"
                    checked={filters.automaticClimate === true}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor="automaticClimate">Klimatyzacja automatyczna</label>
                </div>

                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="heatedSeats"
                    name="heatedSeats"
                    checked={filters.heatedSeats === true}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor="heatedSeats">Podgrzewane fotele</label>
                </div>

                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="leatherSeats"
                    name="leatherSeats"
                    checked={filters.leatherSeats === true}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor="leatherSeats">Skórzane fotele</label>
                </div>

                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="panoramicRoof"
                    name="panoramicRoof"
                    checked={filters.panoramicRoof === true}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor="panoramicRoof">Dach panoramiczny</label>
                </div>
              </div>

              <div className="checkbox-column">
                <h4>Multimedia</h4>
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="navigationSystem"
                    name="navigationSystem"
                    checked={filters.navigationSystem === true}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor="navigationSystem">Nawigacja</label>
                </div>

                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="bluetooth"
                    name="bluetooth"
                    checked={filters.bluetooth === true}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor="bluetooth">Bluetooth</label>
                </div>
              </div>

              <div className="checkbox-column">
                <h4>Bezpieczeństwo i pomoc</h4>
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="parkingSensors"
                    name="parkingSensors"
                    checked={filters.parkingSensors === true}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor="parkingSensors">Czujniki parkowania</label>
                </div>

                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="rearCamera"
                    name="rearCamera"
                    checked={filters.rearCamera === true}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor="rearCamera">Kamera cofania</label>
                </div>
              </div>

              <div className="checkbox-column">
                <h4>Oświetlenie</h4>
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="ledLights"
                    name="ledLights"
                    checked={filters.ledLights === true}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor="ledLights">Światła LED</label>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="filter-actions">
          <button
            type="button"
            className="reset-button"
            onClick={resetFilters}
            disabled={!hasActiveFilters}
          >
            Wyczyść filtry
          </button>

          <button type="submit" className="apply-button">
            Szukaj
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdvancedFilter;
