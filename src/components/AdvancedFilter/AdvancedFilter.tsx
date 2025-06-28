/**
 * Module for advanced search filtering of vehicle offers
 * @module components/AdvancedFilter
 */

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  FuelType,
  TransmissionType,
  BodyType,
  DriveType,
  VehicleCondition,
} from '../../types/offer/OfferTypes';
import './AdvancedFilter.scss';
import offerApiService, { AdvancedSearchParams } from '../../api/offerApi';
import { translations } from '../../translations/carEquipmentTranslations';

/**
 * Converts an enum object to a set of dropdown options with translations
 * @function enumToOptions
 * @param {Object} enumObject - The enum object to convert
 * @param {keyof typeof translations} translationCategory - The category of translations to use
 * @returns {Array<{value: string, label: string}>} Array of options for select dropdown
 */
const enumToOptions = (enumObject: any, translationCategory: keyof typeof translations) => {
  return Object.keys(enumObject)
    .filter(key => isNaN(Number(key)))
    .map(key => {
      // Use type assertion to access the translations safely
      const translationObj = translations[translationCategory] as Record<string, string>;
      const translation = translationObj[key];

      return {
        value: enumObject[key],
        label:
          translation ||
          key
            .replace(/_/g, ' ')
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
      };
    });
};

/**
 * Props for AdvancedFilter component
 * @interface AdvancedFilterProps
 */
interface AdvancedFilterProps {
  /** Callback when search results are available */
  onSearch: (results: any) => void;
  /** Callback to indicate loading state */
  onLoading: (isLoading: boolean) => void;
  /** Initial filter values */
  initialFilters?: AdvancedSearchParams;
  /** Whether to disable automatic search on mount */
  disableAutoSearch?: boolean;
}

/**
 * Advanced filter component for searching vehicle offers
 * Provides filter controls for searching offers by various criteria
 * @component
 * @param {AdvancedFilterProps} props - Component props
 * @returns {JSX.Element} The AdvancedFilter component
 */
const AdvancedFilter = forwardRef<any, AdvancedFilterProps>(
  ({ onSearch, onLoading, initialFilters = {}, disableAutoSearch = false }, ref) => {
    /** Toggle for showing advanced filter options */
    const [showAdvanced, setShowAdvanced] = useState(false);
    /** List of available car brands */
    const [brands, setBrands] = useState<string[]>([]);
    /** List of available car models for selected brand */
    const [models, setModels] = useState<string[]>([]);
    /** Loading state for models dropdown */
    const [modelsLoading, setModelsLoading] = useState(false);
    /** Whether component has been initialized */
    const [initialized, setInitialized] = useState(false);
    /** Whether this is the initial setup */
    const [isInitialSetup, setIsInitialSetup] = useState(true);

    /**
     * State for filter values
     * @type {AdvancedSearchParams}
     */
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

    /**
     * Expose methods for parent component via ref
     */
    useImperativeHandle(ref, () => ({
      /**
       * Gets the current filter values
       * @returns {AdvancedSearchParams} Current filter state
       */
      getCurrentFilters: () => filters,

      /**
       * Initiates a search with current filters
       */
      searchOffers: () => {
        searchOffersWithFilters(filters);
      },

      /**
       * Resets all filters to their default values
       */
      resetFilters: () => {
        resetFilters();
      },

      /**
       * Sets filter values from outside the component
       * @param {AdvancedSearchParams} newFilters - New filter values to apply
       */
      setFilters: (newFilters: AdvancedSearchParams) => {
        console.log('Setting filters from outside:', newFilters);
        setFilters(prev => ({ ...prev, ...newFilters }));
      },
    }));

    /**
     * Option lists for dropdowns
     */
    const fuelTypeOptions = enumToOptions(FuelType, 'fuelType');
    const transmissionOptions = enumToOptions(TransmissionType, 'transmissionType');
    const bodyTypeOptions = enumToOptions(BodyType, 'bodyType');
    const driveTypeOptions = enumToOptions(DriveType, 'driveType');
    const conditionOptions = enumToOptions(VehicleCondition, 'vehicleCondition');

    /**
     * Default car brands to show if API call fails
     */
    const defaultBrands = [
      'Audi',
      'BMW',
      'Fiat',
      'Ford',
      'Honda',
      'Mazda',
      'Mercedes-Benz',
      'Nissan',
      'Peugeot',
      'Skoda',
      'Toyota',
      'Volkswagen',
      'Volvo',
    ].sort();

    /**
     * Set initial filters on first render
     */
    useEffect(() => {
      if (isInitialSetup && Object.keys(initialFilters).length > 0) {
        console.log('Setting initial filters:', initialFilters);

        setFilters(prev => {
          const newFilters = { ...prev };
          Object.keys(initialFilters).forEach(key => {
            if (initialFilters[key as keyof AdvancedSearchParams] !== undefined) {
              (newFilters as any)[key] = initialFilters[key as keyof AdvancedSearchParams];
            }
          });
          return newFilters;
        });

        if (!disableAutoSearch) {
          setTimeout(() => {
            console.log('Executing search with initial filters:', initialFilters);
            searchOffersWithFilters(initialFilters);
          }, 100);
        }

        setIsInitialSetup(false);
      }
    }, [initialFilters, isInitialSetup, disableAutoSearch]);

    /**
     * Perform initial search if needed
     */
    useEffect(() => {
      if (!initialized) {
        // If automatic search is not disabled and we don't have initial filters,
        // fetch all offers
        if (!disableAutoSearch && Object.keys(initialFilters).length === 0) {
          console.log('Executing automatic search for all offers');
          fetchAllOffers();
        }

        setInitialized(true);
      }
    }, [initialized, disableAutoSearch, initialFilters]);

    /**
     * Fetch car brands on component mount
     */
    useEffect(() => {
      const fetchBrands = async () => {
        offerApiService
          .getBrands()
          .then(brandsList => {
            if (brandsList.length > 0) {
              setBrands(brandsList);
            } else {
              setBrands(defaultBrands);
            }
          })
          .catch(error => {
            console.error('Error fetching brands:', error);
            setBrands(defaultBrands);
          });
      };

      fetchBrands();
    }, []);

    /**
     * Fetch car models when brand changes
     */
    useEffect(() => {
      const fetchModels = async () => {
        if (!filters.brand) {
          setModels([]);
          return;
        }

        setModelsLoading(true);

        offerApiService
          .getModelsByBrand(filters.brand)
          .then(modelsList => {
            console.log(`Fetched models for ${filters.brand}:`, modelsList);
            setModels(modelsList);
          })
          .catch(error => {
            console.error('Error fetching models for brand:', error);
            setModels([]);
          })
          .finally(() => {
            setModelsLoading(false);
          });
      };

      fetchModels();
    }, [filters.brand]);

    /**
     * Reset model when brand changes
     */
    useEffect(() => {
      if (filters.brand) {
        setFilters(prev => ({ ...prev, model: '' }));
      }
    }, [filters.brand]);

    /**
     * Fetches all offers without filtering
     * @function fetchAllOffers
     */
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

    /**
     * Handles input field changes
     * @function handleInputChange
     * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} e - Change event
     */
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

    /**
     * Handles checkbox changes
     * @function handleCheckboxChange
     * @param {React.ChangeEvent<HTMLInputElement>} e - Change event
     */
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;
      setFilters(prev => ({ ...prev, [name]: checked ? true : null }));
    };

    /**
     * Executes a search with the given filters
     * @function searchOffersWithFilters
     * @param {AdvancedSearchParams} searchFilters - Filters to search with
     */
    const searchOffersWithFilters = (searchFilters: AdvancedSearchParams) => {
      console.log('Searching with filters:', searchFilters);
      onLoading(true);

      offerApiService
        .searchOffers(searchFilters)
        .then(response => {
          console.log('Search results received:', response);
          onSearch(response);
        })
        .catch(error => {
          console.error('Error searching offers:', error);
        })
        .finally(() => {
          onLoading(false);
        });
    };

    /**
     * Handles form submission
     * @function searchOffers
     * @param {React.FormEvent} e - Form event
     */
    const searchOffers = (e: React.FormEvent) => {
      e.preventDefault();
      searchOffersWithFilters(filters);
    };

    /**
     * Resets all filters to default values
     * @function resetFilters
     */
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

      setModels([]);
      fetchAllOffers();
    };

    /**
     * Toggles visibility of advanced filters section
     * @function toggleAdvancedFilters
     */
    const toggleAdvancedFilters = () => {
      setShowAdvanced(!showAdvanced);
    };

    /**
     * Checks if any filters are active
     * @type {boolean}
     */
    const hasActiveFilters = Object.values(filters).some(value => value !== null && value !== '');

    /**
     * Current year for year input validation
     * @type {number}
     */
    const currentYear = new Date().getFullYear();

    return (
      <div className="advanced-filter">
        <div onSubmit={searchOffers}>
          <div className="filter-section basic-filters">
            <div className="filter-row">
              <div className="filter-field">
                <label htmlFor="phrase">Szukaj</label>
                <input
                  type="text"
                  id="phrase"
                  name="phrase"
                  placeholder="Nazwa, marka, model..."
                  value={filters.phrase || ''}
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
                  disabled={!filters.brand || modelsLoading}
                >
                  <option value="">
                    {!filters.brand
                      ? 'Najpierw wybierz markę'
                      : modelsLoading
                        ? 'Ładowanie modeli...'
                        : models.length === 0
                          ? 'Brak dostępnych modeli'
                          : 'Wszystkie modele'}
                  </option>
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

            <button type="button" className="apply-button" onClick={searchOffers}>
              Szukaj
            </button>
          </div>
        </div>
      </div>
    );
  }
);

export default AdvancedFilter;