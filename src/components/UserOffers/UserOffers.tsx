import React, { useEffect, useState } from 'react';
import './UserOffers.scss';
import { getUserOffers, deleteOffer } from '../../api/offerApi';
import {ApiOffer, OfferData} from "../../types/offerTypes.ts";

const DEFAULT_CAR_IMAGE = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2U5ZWNlZiIvPjxwYXRoIGQ9Ik0xNzUuMTIsMTI4LjVINzQuODhhMTIsMTIsMCwwLDAtMTIsOUw1NywxNzFhNiw2LDAsMCwwLDYsNmgxMzBhNiw2LDAsMCwwLDYtNmwtNS44OC0zMy41QTEyLDEyLDAsMCwwLDE3NS4xMiwxMjguNVoiIGZpbGw9IiM2Yzc1N2QiLz48Y2lyY2xlIGN4PSI4NCIgY3k9IjE2MSIgcj0iMTIiIGZpbGw9IiNlOWVjZWYiLz48Y2lyY2xlIGN4PSIxNzIiIGN5PSIxNjEiIHI9IjEyIiBmaWxsPSIjZTllY2VmIi8+PHBhdGggZD0iTTE5MywxMjIuMjRsLTI1LjI0LTI1LjI0QTIwLDIwLDAsMCwwLDE1My40LDkwaC01MC44YTIwLDIwLDAsMCwwLTE0LjE0LDUuODZMNjMuMjIsMTIwLjg2YTIwLDIwLDAsMCwwLTYsMTZsMS40OSwxMy4wN0EyMCwyMCwwLDAsMCw3OC4xOCwxNjhoOTkuNjVBMjAsMjAsMCwwLDAsMTk3LjM4LDE1MGwxLjQ5LTEzLjA3QTIwLDIwLDAsMCwwLDE5MywxMjIuMjRaIiBmaWxsPSIjNmM3NTdkIi8+PC9zdmc+";

const formatPrice = (price: number, currency: string = 'zł'): string => {
    return price.toLocaleString('pl-PL') + ' ' + currency;
};

const formatMileage = (mileage: number): string => {
    return mileage.toLocaleString('pl-PL') + ' km';
};

const fuelTypeTranslations: Record<string, string> = {
    'PETROL': 'Benzyna',
    'DIESEL': 'Diesel',
    'LPG': 'LPG',
    'HYBRID': 'Hybryda',
    'ELECTRIC': 'Elektryczny',
    'HYDROGEN': 'Wodór',
    'OTHER': 'Inny'
};

const mapApiResponseToComponentFormat = (apiOffers: ApiOffer[]): OfferData[] => {
    if (!apiOffers || !Array.isArray(apiOffers)) {
        console.log("⚠️ Brak danych lub nieprawidłowy format");
        return [];
    }

    return apiOffers.map(offer => {
        return {
            id: offer.id,
            title: offer.title,
            description: offer.description || "",
            price: offer.price,
            currency: offer.currency || "zł",
            seller: offer.seller || {
                id: "unknownSellerId",
                firstName: "Unknown",
                lastName: "Seller",
                email: "unknown@example.com"
            },
            location: offer.location || "",
            contactPhone: offer.contactPhone || "",
            contactEmail: offer.contactEmail || "",
            mainImage: offer.mainImage || "",
            CarDetailsDto: {
                brand: offer.brand || "Unknown",
                model: offer.model || "Unknown",
                year: offer.year || 0,
                color: offer.color || "",
                displacement: offer.displacement || "",
                mileage: offer.mileage || 0,
                fuelType: offer.fuelType || "OTHER",
                transmission: offer.transmission || "",
                bodyType: offer.bodyType || "",
                driveType: String(offer.driveType || ""),
                enginePower: offer.enginePower || 0,
                doors: offer.doors || 0,
                seats: offer.seats || 0
            }
        };
    });
};

const UserOffers: React.FC = () => {
    const [offers, setOffers] = useState<OfferData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [noUserIdError, setNoUserIdError] = useState<boolean>(false);

    useEffect(() => {
        const fetchUserOffers = async () => {
            try {
                setLoading(true);

                const userId = localStorage.getItem('userId');

                if (!userId) {
                    console.warn('Nie znaleziono ID użytkownika w localStorage.');
                    setNoUserIdError(true);
                    setLoading(false);
                    return;
                }

                console.log("Pobieranie ofert dla użytkownika ID:", userId);
                const data = await getUserOffers(userId);

                if (data && data.content) {
                    console.log('Otrzymane dane:', data.content);
                    const mappedOffers = mapApiResponseToComponentFormat(data.content);
                    console.log('Zmapowane dane:', mappedOffers);
                    setOffers(mappedOffers);
                } else {
                    console.warn('Otrzymano puste dane odpowiedzi');
                    setOffers([]);
                }
            } catch (err) {
                console.error('Błąd podczas pobierania ogłoszeń:', err);
                setError('Nie udało się pobrać ogłoszeń. Spróbuj ponownie później.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserOffers();
    }, []);

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = DEFAULT_CAR_IMAGE;
    };

    const handleEditOffer = (offerId: string) => {
        window.location.href = `/offer/edit/${offerId}`;
    };

    const handleDeleteOffer = async (offerId: string) => {
        if (window.confirm('Czy na pewno chcesz usunąć to ogłoszenie?')) {
            try {
                const success = await deleteOffer(offerId);

                if (success) {
                    setOffers(offers.filter(offer => offer.id !== offerId));
                } else {
                    throw new Error('Serwer zwrócił błąd.');
                }
            } catch (err) {
                console.error('Błąd podczas usuwania ogłoszenia:', err);
                alert('Nie udało się usunąć ogłoszenia. Spróbuj ponownie później.');
            }
        }
    };

    const redirectToProfile = () => {
        window.location.href = '/user/panel';
    };

    const OfferCard: React.FC<{ offer: OfferData }> = ({ offer }) => {
        if (!offer || !offer.CarDetailsDto) {
            return null;
        }

        const translatedFuelType = fuelTypeTranslations[offer.CarDetailsDto.fuelType] || offer.CarDetailsDto.fuelType;

        return (
            <div className="offer-card">
                <div className="offer-image">
                    <img
                        src={offer.mainImage || DEFAULT_CAR_IMAGE}
                        alt={offer.title}
                        onError={handleImageError}
                    />
                </div>
                <div className="offer-details">
                    <h4 className="offer-title">{offer.title}</h4>
                    <div className="offer-specs">
                        <span className="offer-year">{offer.CarDetailsDto.year}</span>
                        <span className="offer-engine">
                            {offer.CarDetailsDto.enginePower} KM | {offer.CarDetailsDto.displacement} | {translatedFuelType}
                        </span>
                        <span className="offer-mileage">{formatMileage(offer.CarDetailsDto.mileage)}</span>
                    </div>
                    <div className="offer-price">{formatPrice(offer.price, offer.currency)}</div>
                </div>
                <div className="offer-actions">
                    <button
                        className="edit-offer-btn"
                        onClick={() => handleEditOffer(offer.id)}
                    >
                        Edytuj
                    </button>
                    <button
                        className="delete-offer-btn"
                        onClick={() => handleDeleteOffer(offer.id)}
                    >
                        Usuń
                    </button>
                </div>
            </div>
        );
    };

    const navigateToCreateOffer = () => {
        window.location.href = '/offer/create';
    };

    const renderOffers = () => {
        if (loading) {
            return <div className="offers-loading">Ładowanie ogłoszeń...</div>;
        }

        if (noUserIdError) {
            return (
                <div className="offers-error">
                    <p>Nie można pobrać ogłoszeń. Brak ID użytkownika.</p>
                    <p>Przejdź najpierw do profilu, aby załadować swoje dane.</p>
                    <button className="primary-btn" onClick={redirectToProfile}>
                        Przejdź do profilu
                    </button>
                </div>
            );
        }

        if (error) {
            return <div className="offers-error">{error}</div>;
        }

        if (!offers || offers.length === 0) {
            return (
                <div className="offers-empty">
                    <p>Obecnie nie masz żadnych aktywnych ogłoszeń.</p>
                    <button className="create-offer-btn" onClick={navigateToCreateOffer}>
                        Dodaj nowe ogłoszenie
                    </button>
                </div>
            );
        }

        return (
            <div className="offers-list">
                {offers.map(offer => (
                    <OfferCard key={offer.id} offer={offer} />
                ))}
                <div className="add-offer-container">
                    <button className="create-offer-btn" onClick={navigateToCreateOffer}>
                        Dodaj nowe ogłoszenie
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="user-offers">
            <h3>Moje ogłoszenia</h3>
            {renderOffers()}
        </div>
    );
};

export default UserOffers;