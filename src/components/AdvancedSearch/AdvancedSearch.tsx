import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronDown, Car, MapPin, Fuel } from 'lucide-react';
import {
    FuelType,
    TransmissionType,
    BodyType,
    DriveType,
    VehicleCondition,
    SearchFilters,
    AdvancedSearchProps,
    translations,
    equipmentOptions,
    popularBrands
} from '../../types/searchTypes';
import { offerSearchService } from '../../services/offerSearchService';

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSearch, initialFilters }) => {
    const navigate = useNavigate();
    const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [searchFilters, setSearchFilters] = useState<SearchFilters>({
        searchTerm: '',
        brand: '',
        model: '',
        priceFrom: '',
        priceTo: '',
        currency: 'PLN',
        yearFrom: '',
        yearTo: '',
        mileageFrom: '',
        mileageTo: '',
        location: '',
        fuelType: [],
        transmission: [],
        bodyType: [],
        driveType: [],
        condition: [],
        enginePowerFrom: '',
        enginePowerTo: '',
        doors: '',
        seats: '',
        equipment: {
            airConditioning: false,
            automaticClimate: false,
            heatedSeats: false,
            navigationSystem: false,
            bluetooth: false,
            parkingSensors: false,
            rearCamera: false,
            cruiseControl: false,
            xenonLights: false,
            ledLights: false
        },
        ...initialFilters
    });

    const handleInputChange = (field: keyof SearchFilters, value: string): void => {
        setSearchFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayToggle = (
        field: 'fuelType' | 'transmission' | 'bodyType' | 'driveType' | 'condition',
        value: FuelType | TransmissionType | BodyType | DriveType | VehicleCondition
    ): void => {
        setSearchFilters(prev => {
            const currentArray = prev[field] as (FuelType | TransmissionType | BodyType | DriveType | VehicleCondition)[];
            const newArray = currentArray.includes(value)
                ? currentArray.filter(item => item !== value)
                : [...currentArray, value];
            return { ...prev, [field]: newArray };
        });
    };

    const handleEquipmentToggle = (equipment: keyof SearchFilters['equipment']): void => {
        setSearchFilters(prev => ({
            ...prev,
            equipment: {
                ...prev.equipment,
                [equipment]: !prev.equipment[equipment]
            }
        }));
    };

    const clearFilters = (): void => {
        const clearedFilters: SearchFilters = {
            searchTerm: '',
            brand: '',
            model: '',
            priceFrom: '',
            priceTo: '',
            currency: 'PLN',
            yearFrom: '',
            yearTo: '',
            mileageFrom: '',
            mileageTo: '',
            location: '',
            fuelType: [],
            transmission: [],
            bodyType: [],
            driveType: [],
            condition: [],
            enginePowerFrom: '',
            enginePowerTo: '',
            doors: '',
            seats: '',
            equipment: {
                airConditioning: false,
                automaticClimate: false,
                heatedSeats: false,
                navigationSystem: false,
                bluetooth: false,
                parkingSensors: false,
                rearCamera: false,
                cruiseControl: false,
                xenonLights: false,
                ledLights: false
            }
        };
        setSearchFilters(clearedFilters);
        setError(null);
    };

    // Sprawdza czy są zaawansowane filtry
    const hasAdvancedFilters = (): boolean => {
        return searchFilters.fuelType.length > 0 ||
               searchFilters.transmission.length > 0 ||
               searchFilters.bodyType.length > 0 ||
               searchFilters.driveType.length > 0 ||
               searchFilters.condition.length > 0 ||
               searchFilters.enginePowerFrom.trim() !== '' ||
               searchFilters.enginePowerTo.trim() !== '' ||
               searchFilters.doors.trim() !== '' ||
               searchFilters.seats.trim() !== '' ||
               Object.values(searchFilters.equipment).some(val => val === true);
    };

    // NOWA FUNKCJA WYSZUKIWANIA Z API
    const handleSearch = async (): Promise<void> => {
        // Jeśli jest callback onSearch, użyj go (dla custom logiki)
        if (onSearch) {
            onSearch(searchFilters);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Testuj API - wykonaj wyszukiwanie
            const response = await offerSearchService.searchOffers(searchFilters, 0, 5);
            
            console.log('✅ Search successful:', response);
            
            // Tworzenie URL params dla przekierowania
            const params = new URLSearchParams();

            // Podstawowe parametry
            if (searchFilters.searchTerm?.trim()) {
                params.set('phrase', searchFilters.searchTerm.trim());
            }

            if (searchFilters.brand?.trim()) {
                params.set('brand', searchFilters.brand.trim());
            }

            if (searchFilters.model?.trim()) {
                params.set('model', searchFilters.model.trim());
            }

            if (searchFilters.location?.trim()) {
                params.set('location', searchFilters.location.trim());
            }

            // Ceny
            if (searchFilters.priceFrom?.trim()) {
                params.set('minPrice', searchFilters.priceFrom.replace(/\s/g, ''));
            }

            if (searchFilters.priceTo?.trim()) {
                params.set('maxPrice', searchFilters.priceTo.replace(/\s/g, ''));
            }

            // Lata
            if (searchFilters.yearFrom?.trim()) {
                params.set('yearFrom', searchFilters.yearFrom);
            }

            if (searchFilters.yearTo?.trim()) {
                params.set('yearTo', searchFilters.yearTo);
            }

            // Przebieg
            if (searchFilters.mileageFrom?.trim()) {
                params.set('mileageFrom', searchFilters.mileageFrom.replace(/\s/g, ''));
            }

            if (searchFilters.mileageTo?.trim()) {
                params.set('mileageTo', searchFilters.mileageTo.replace(/\s/g, ''));
            }

            // Moc silnika
            if (searchFilters.enginePowerFrom?.trim()) {
                params.set('enginePowerFrom', searchFilters.enginePowerFrom);
            }

            if (searchFilters.enginePowerTo?.trim()) {
                params.set('enginePowerTo', searchFilters.enginePowerTo);
            }

            // Drzwi i miejsca
            if (searchFilters.doors?.trim()) {
                params.set('doors', searchFilters.doors);
            }

            if (searchFilters.seats?.trim()) {
                params.set('seats', searchFilters.seats);
            }

            // Arrays - każdy element osobno (tak jak Spring Boot oczekuje)
            if (searchFilters.fuelType?.length > 0) {
                searchFilters.fuelType.forEach(fuel => params.append('fuelType', fuel));
            }

            if (searchFilters.transmission?.length > 0) {
                searchFilters.transmission.forEach(trans => params.append('transmission', trans));
            }

            if (searchFilters.bodyType?.length > 0) {
                searchFilters.bodyType.forEach(body => params.append('bodyType', body));
            }

            if (searchFilters.driveType?.length > 0) {
                searchFilters.driveType.forEach(drive => params.append('driveType', drive));
            }

            if (searchFilters.condition?.length > 0) {
                searchFilters.condition.forEach(cond => params.append('condition', cond));
            }

            // Equipment - tylko zaznaczone opcje
            const selectedEquipment = Object.entries(searchFilters.equipment)
                .filter(([_, isSelected]) => isSelected)
                .map(([key, _]) => key);

            if (selectedEquipment.length > 0) {
                selectedEquipment.forEach(eq => params.append('equipment', eq));
            }

            // Przekieruj do strony z wynikami
            const searchUrl = `/offers?${params.toString()}`;
            console.log('🔗 Redirecting to:', searchUrl);
            navigate(searchUrl);
            
        } catch (err) {
            console.error('❌ Search failed:', err);
            setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas wyszukiwania');
        } finally {
            setLoading(false);
        }
    };

    const getActiveFiltersCount = (): number => {
        let count = 0;

        if (searchFilters.searchTerm?.trim()) count++;
        if (searchFilters.brand?.trim()) count++;
        if (searchFilters.model?.trim()) count++;
        if (searchFilters.location?.trim()) count++;
        if (searchFilters.priceFrom?.trim()) count++;
        if (searchFilters.priceTo?.trim()) count++;
        if (searchFilters.yearFrom?.trim()) count++;
        if (searchFilters.yearTo?.trim()) count++;
        if (searchFilters.mileageFrom?.trim()) count++;
        if (searchFilters.mileageTo?.trim()) count++;
        if (searchFilters.enginePowerFrom?.trim()) count++;
        if (searchFilters.enginePowerTo?.trim()) count++;
        if (searchFilters.doors?.trim()) count++;
        if (searchFilters.seats?.trim()) count++;
        if (searchFilters.fuelType?.length > 0) count++;
        if (searchFilters.transmission?.length > 0) count++;
        if (searchFilters.bodyType?.length > 0) count++;
        if (searchFilters.driveType?.length > 0) count++;
        if (searchFilters.condition?.length > 0) count++;
        
        const selectedEquipment = Object.values(searchFilters.equipment).filter(val => val === true);
        if (selectedEquipment.length > 0) count++;

        return count;
    };

    // STYLE - dodany margin-top dla navbar
    const containerStyle: React.CSSProperties = {
        maxWidth: '100%',
        margin: '0',
        marginTop: '80px',
        padding: '16px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: 'transparent'
    };

    const cardStyle: React.CSSProperties = {
        background: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        border: '1px solid rgba(0, 0, 0, 0.04)',
        transition: 'all 0.3s ease'
    };

    const compactInputStyle: React.CSSProperties = {
        padding: '10px',
        border: '1.5px solid #e5e5e7',
        borderRadius: '6px',
        fontSize: '14px',
        color: '#1d1d1f',
        background: '#ffffff',
        transition: 'all 0.2s ease',
        outline: 'none',
        boxSizing: 'border-box',
        width: '100%'
    };

    const buttonStyle: React.CSSProperties = {
        background: loading ? '#86868b' : '#007aff',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: loading ? 0.7 : 1
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                {/* Error display */}
                {error && (
                    <div style={{
                        background: '#ffebee',
                        color: '#c62828',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '16px',
                        fontSize: '14px',
                        border: '1px solid #ffcdd2'
                    }}>
                        <strong>Błąd wyszukiwania:</strong> {error}
                    </div>
                )}

                {/* Search Row */}
                <div style={{ 
                    display: 'flex', 
                    gap: '10px',
                    marginBottom: '14px',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ position: 'relative', flex: '2', minWidth: '200px' }}>
                        <Search style={{
                            position: 'absolute',
                            left: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#86868b',
                            width: '16px',
                            height: '16px'
                        }} />
                        <input
                            type="text"
                            placeholder="Wyszukaj marki, modele..."
                            value={searchFilters.searchTerm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                handleInputChange('searchTerm', e.target.value)
                            }
                            style={{ ...compactInputStyle, paddingLeft: '32px' }}
                            disabled={loading}
                        />
                    </div>
                    <div style={{ position: 'relative', flex: '1', minWidth: '160px' }}>
                        <MapPin style={{
                            position: 'absolute',
                            left: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#86868b',
                            width: '16px',
                            height: '16px'
                        }} />
                        <input
                            type="text"
                            placeholder="Lokalizacja"
                            value={searchFilters.location}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                handleInputChange('location', e.target.value)
                            }
                            style={{ ...compactInputStyle, paddingLeft: '32px' }}
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Quick Filters */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '10px',
                    marginBottom: '16px'
                }}>
                    <select
                        value={searchFilters.brand}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                            handleInputChange('brand', e.target.value)
                        }
                        style={compactInputStyle}
                        disabled={loading}
                    >
                        <option value="">Wszystkie marki</option>
                        {popularBrands.map((brand: string) => (
                            <option key={brand} value={brand}>{brand}</option>
                        ))}
                    </select>

                    <input
                        type="text"
                        placeholder="Model"
                        value={searchFilters.model}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            handleInputChange('model', e.target.value)
                        }
                        style={compactInputStyle}
                        disabled={loading}
                    />

                    <div style={{ display: 'flex', gap: '4px' }}>
                        <input
                            type="number"
                            placeholder="Cena od"
                            value={searchFilters.priceFrom}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                handleInputChange('priceFrom', e.target.value)
                            }
                            style={compactInputStyle}
                            disabled={loading}
                        />
                        <input
                            type="number"
                            placeholder="do"
                            value={searchFilters.priceTo}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                handleInputChange('priceTo', e.target.value)
                            }
                            style={compactInputStyle}
                            disabled={loading}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '4px' }}>
                        <input
                            type="number"
                            placeholder="Rok od"
                            value={searchFilters.yearFrom}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                handleInputChange('yearFrom', e.target.value)
                            }
                            style={compactInputStyle}
                            disabled={loading}
                        />
                        <input
                            type="number"
                            placeholder="do"
                            value={searchFilters.yearTo}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                handleInputChange('yearTo', e.target.value)
                            }
                            style={compactInputStyle}
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Controls */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px'
                }}>
                    <button
                        onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'none',
                            border: 'none',
                            color: '#007aff',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            padding: '4px 0'
                        }}
                        disabled={loading}
                    >
                        <Filter size={14} />
                        Filtry zaawansowane {hasAdvancedFilters() && '●'}
                        <ChevronDown style={{
                            width: '14px',
                            height: '14px',
                            transform: isAdvancedOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease'
                        }} />
                    </button>
                    
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#86868b' }}>
                            Filtry: {getActiveFiltersCount()}
                        </span>
                        <button 
                            onClick={clearFilters}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#86868b',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                padding: '4px 10px'
                            }}
                            disabled={loading}
                        >
                            Wyczyść
                        </button>
                        <button 
                            onClick={handleSearch} 
                            style={buttonStyle}
                            disabled={loading}
                        >
                            {loading ? 'Szukanie...' : 'Szukaj'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Advanced Filters */}
            {isAdvancedOpen && (
                <div style={{
                    ...cardStyle,
                    position: 'relative',
                    zIndex: 9999,
                    padding: '16px'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '16px'
                    }}>
                        
                        {/* Fuel Type */}
                        <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '12px' }}>
                            <h4 style={{
                                fontSize: '15px',
                                fontWeight: '600',
                                color: '#1d1d1f',
                                marginBottom: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                <Fuel style={{ width: '14px', height: '14px', color: '#007aff' }} />
                                Rodzaj paliwa
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {Object.entries(FuelType).map(([key, value]) => (
                                    <label key={key} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        padding: '1px 0',
                                        fontSize: '13px'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={searchFilters.fuelType.includes(value)}
                                            onChange={() => handleArrayToggle('fuelType', value)}
                                            style={{ marginRight: '6px' }}
                                            disabled={loading}
                                        />
                                        <span style={{ color: '#1d1d1f' }}>
                                            {translations.fuelType[key as keyof typeof FuelType]}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Transmission */}
                        <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '12px' }}>
                            <h4 style={{
                                fontSize: '15px',
                                fontWeight: '600',
                                color: '#1d1d1f',
                                marginBottom: '10px'
                            }}>Skrzynia biegów</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {Object.entries(TransmissionType).map(([key, value]) => (
                                    <label key={key} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        padding: '1px 0',
                                        fontSize: '13px'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={searchFilters.transmission.includes(value)}
                                            onChange={() => handleArrayToggle('transmission', value)}
                                            style={{ marginRight: '6px' }}
                                            disabled={loading}
                                        />
                                        <span style={{ color: '#1d1d1f' }}>
                                            {translations.transmission[key as keyof typeof TransmissionType]}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Body Type */}
                        <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '12px' }}>
                            <h4 style={{
                                fontSize: '15px',
                                fontWeight: '600',
                                color: '#1d1d1f',
                                marginBottom: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                <Car style={{ width: '14px', height: '14px', color: '#007aff' }} />
                                Typ nadwozia
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {Object.entries(BodyType).map(([key, value]) => (
                                    <label key={key} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        padding: '1px 0',
                                        fontSize: '13px'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={searchFilters.bodyType.includes(value)}
                                            onChange={() => handleArrayToggle('bodyType', value)}
                                            style={{ marginRight: '6px' }}
                                            disabled={loading}
                                        />
                                        <span style={{ color: '#1d1d1f' }}>
                                            {translations.bodyType[key as keyof typeof BodyType]}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Drive Type */}
                        <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '12px' }}>
                            <h4 style={{
                                fontSize: '15px',
                                fontWeight: '600',
                                color: '#1d1d1f',
                                marginBottom: '10px'
                            }}>Napęd</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {Object.entries(DriveType).map(([key, value]) => (
                                    <label key={key} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        padding: '1px 0',
                                        fontSize: '13px'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={searchFilters.driveType.includes(value)}
                                            onChange={() => handleArrayToggle('driveType', value)}
                                            style={{ marginRight: '6px' }}
                                            disabled={loading}
                                        />
                                        <span style={{ color: '#1d1d1f' }}>
                                            {translations.driveType[key as keyof typeof DriveType]}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Condition */}
                        <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '12px' }}>
                            <h4 style={{
                                fontSize: '15px',
                                fontWeight: '600',
                                color: '#1d1d1f',
                                marginBottom: '10px'
                            }}>Stan pojazdu</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {Object.entries(VehicleCondition).map(([key, value]) => (
                                    <label key={key} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        padding: '1px 0',
                                        fontSize: '13px'  
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={searchFilters.condition.includes(value)}
                                            onChange={() => handleArrayToggle('condition', value)}
                                            style={{ marginRight: '6px' }}
                                            disabled={loading}
                                        />
                                        <span style={{ color: '#1d1d1f' }}>
                                            {translations.condition[key as keyof typeof VehicleCondition]}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Technical Parameters */}
                        <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '12px' }}>
                            <h4 style={{
                                fontSize: '15px',
                                fontWeight: '600',
                                color: '#1d1d1f',
                                marginBottom: '10px'
                            }}>Parametry techniczne</h4>
                            
                            <div style={{ marginBottom: '10px' }}>
                                <div style={{
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    color: '#1d1d1f',
                                    marginBottom: '4px'
                                }}>Przebieg (km)</div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <input
                                        type="number"
                                        placeholder="od"
                                        value={searchFilters.mileageFrom}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                            handleInputChange('mileageFrom', e.target.value)
                                        }
                                        style={{ ...compactInputStyle, padding: '6px' }}
                                        disabled={loading}
                                    />
                                    <input
                                        type="number"
                                        placeholder="do"
                                        value={searchFilters.enginePowerTo}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                            handleInputChange('enginePowerTo', e.target.value)
                                        }
                                        style={{ ...compactInputStyle, padding: '6px' }}
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                                <div>
                                    <div style={{
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        color: '#1d1d1f',
                                        marginBottom: '4px'
                                    }}>Drzwi</div>
                                    <select
                                        value={searchFilters.doors}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                                            handleInputChange('doors', e.target.value)
                                        }
                                        style={{ ...compactInputStyle, padding: '6px' }}
                                        disabled={loading}
                                    >
                                        <option value="">Dowolna</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                                <div>
                                    <div style={{
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        color: '#1d1d1f',
                                        marginBottom: '4px'
                                    }}>Miejsca</div>
                                    <select
                                        value={searchFilters.seats}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                                            handleInputChange('seats', e.target.value)
                                        }
                                        style={{ ...compactInputStyle, padding: '6px' }}
                                        disabled={loading}
                                    >
                                        <option value="">Dowolna</option>
                                        <option value="2">2</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                        <option value="7">7</option>
                                        <option value="8">8+</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Equipment - full width */}
                    <div style={{
                        background: '#f9f9f9',
                        borderRadius: '8px',
                        padding: '12px',
                        marginTop: '12px',
                        gridColumn: '1 / -1'
                    }}>
                        <h4 style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#1d1d1f',
                            marginBottom: '10px'
                        }}>Wyposażenie</h4>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                            gap: '6px'
                        }}>
                            {equipmentOptions.map(({ key, label }) => (
                                <label key={key} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    padding: '1px 0',
                                    fontSize: '13px'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={searchFilters.equipment[key]}
                                        onChange={() => handleEquipmentToggle(key)}
                                        style={{ marginRight: '6px' }}
                                        disabled={loading}
                                    />
                                    <span style={{ color: '#1d1d1f' }}>
                                        {label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedSearch;