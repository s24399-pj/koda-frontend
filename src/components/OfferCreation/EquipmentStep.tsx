/**
 * Component for selecting vehicle equipment options in the offer creation process
 * @module components/OfferCreation/EquipmentStep
 */

import React from 'react';
import { FormikProps, Field, FieldInputProps } from 'formik';
import { OfferFormValues } from '../../types/offer/OfferTypes';

/**
 * Props for EquipmentStep component
 * @interface EquipmentStepProps
 */
interface EquipmentStepProps {
  /** Formik props object for form handling */
  formik: FormikProps<OfferFormValues>;
  /** Function to proceed to the next step */
  onNext: () => void;
  /** Function to go back to the previous step */
  onPrevious: () => void;
}

/**
 * Props for Formik field render functions
 * @interface FieldRenderProps
 */
interface FieldRenderProps {
  /** Formik field input props */
  field: FieldInputProps<any>;
  /** Formik form object */
  form: FormikProps<OfferFormValues>;
}

/**
 * Component for selecting vehicle equipment options grouped by categories
 * This is an optional step in the multi-step form process
 * @component
 * @param {EquipmentStepProps} props - Component props
 * @returns {JSX.Element} The EquipmentStep component
 */
const EquipmentStep: React.FC<EquipmentStepProps> = ({ formik, onNext, onPrevious }) => {
  /**
   * Checks if any equipment options have been selected
   * @function hasSelectedEquipment
   * @returns {boolean} True if at least one equipment option is selected
   */
  const hasSelectedEquipment = () => {
    const equipment = formik.values.equipment || {};
    return Object.values(equipment).some(value => value === true);
  };

  return (
    <div className="form-step">
      <h2>Wyposażenie pojazdu</h2>

      <div className="equipment-section">
        <h3>Komfort</h3>
        <div className="equipment-grid">
          <div className="checkbox-group">
            <Field
              name="equipment.airConditioning"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.airConditioning"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.airConditioning', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.airConditioning">Klimatyzacja</label>
          </div>

          <div className="checkbox-group">
            <Field
              name="equipment.automaticClimate"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.automaticClimate"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.automaticClimate', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.automaticClimate">Klimatyzacja automatyczna</label>
          </div>

          <div className="checkbox-group">
            <Field
              name="equipment.heatedSeats"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.heatedSeats"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.heatedSeats', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.heatedSeats">Podgrzewane fotele</label>
          </div>

          <div className="checkbox-group">
            <Field
              name="equipment.electricSeats"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.electricSeats"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.electricSeats', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.electricSeats">Elektryczne fotele</label>
          </div>

          <div className="checkbox-group">
            <Field
              name="equipment.leatherSeats"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.leatherSeats"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.leatherSeats', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.leatherSeats">Skórzane fotele</label>
          </div>

          <div className="checkbox-group">
            <Field
              name="equipment.panoramicRoof"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.panoramicRoof"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.panoramicRoof', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.panoramicRoof">Dach panoramiczny</label>
          </div>

          <div className="checkbox-group">
            <Field
              name="equipment.electricWindows"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.electricWindows"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.electricWindows', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.electricWindows">Elektryczne szyby</label>
          </div>

          <div className="checkbox-group">
            <Field
              name="equipment.electricMirrors"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.electricMirrors"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.electricMirrors', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.electricMirrors">Elektryczne lusterka</label>
          </div>

          <div className="checkbox-group">
            <Field
              name="equipment.keylessEntry"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.keylessEntry"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.keylessEntry', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.keylessEntry">Bezkluczykowy dostęp</label>
          </div>

          <div className="checkbox-group">
            <Field
              name="equipment.wheelHeating"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.wheelHeating"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.wheelHeating', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.wheelHeating">Podgrzewana kierownica</label>
          </div>
        </div>
      </div>

      <div className="equipment-section">
        <h3>Multimedia</h3>
        <div className="equipment-grid">
          <div className="checkbox-group">
            <Field
              name="equipment.navigationSystem"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.navigationSystem"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.navigationSystem', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.navigationSystem">System nawigacji</label>
          </div>

          <div className="checkbox-group">
            <Field
              name="equipment.bluetooth"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.bluetooth"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.bluetooth', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.bluetooth">Bluetooth</label>
          </div>

          <div className="checkbox-group">
            <Field
              name="equipment.usbPort"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.usbPort"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.usbPort', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.usbPort">Port USB</label>
          </div>

          <div className="checkbox-group">
            <Field
              name="equipment.multifunction"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.multifunction"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.multifunction', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.multifunction">Wielofunkcyjna kierownica</label>
          </div>

          <div className="checkbox-group">
            <Field
              name="equipment.androidAuto"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.androidAuto"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.androidAuto', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.androidAuto">Android Auto</label>
          </div>

          <div className="checkbox-group">
            <Field
              name="equipment.appleCarPlay"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.appleCarPlay"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.appleCarPlay', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.appleCarPlay">Apple CarPlay</label>
          </div>

          <div className="checkbox-group">
            <Field
              name="equipment.soundSystem"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.soundSystem"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.soundSystem', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.soundSystem">System nagłośnienia</label>
          </div>
        </div>
      </div>

      <div className="equipment-section">
        <h3>Systemy wspomagające</h3>
        <div className="equipment-grid">
          <div className="checkbox-group">
            <Field
              name="equipment.parkingSensors"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.parkingSensors"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.parkingSensors', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.parkingSensors">Czujniki parkowania</label>
          </div>

          <div className="checkbox-group">
            <Field
              name="equipment.rearCamera"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.rearCamera"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.rearCamera', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.rearCamera">Kamera cofania</label>
          </div>

          <div className="checkbox-group">
            <Field
              name="equipment.cruiseControl"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.cruiseControl"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.cruiseControl', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.cruiseControl">Tempomat</label>
          </div>

          <div className="checkbox-group">
            <Field
              name="equipment.adaptiveCruiseControl"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.adaptiveCruiseControl"
                  checked={Boolean(field.value)}
                  onChange={() =>
                    form.setFieldValue('equipment.adaptiveCruiseControl', !field.value)
                  }
                />
              )}
            />
            <label htmlFor="equipment.adaptiveCruiseControl">Adaptacyjny tempomat</label>
          </div>

          <div className="checkbox-group">
            <Field
              name="equipment.laneAssist"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.laneAssist"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.laneAssist', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.laneAssist">Asystent pasa ruchu</label>
          </div>

          <div className="checkbox-group">
            <Field
              name="equipment.blindSpotDetection"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.blindSpotDetection"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.blindSpotDetection', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.blindSpotDetection">Detekcja martwego pola</label>
          </div>

          <div className="checkbox-group">
            <Field
              name="equipment.emergencyBraking"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.emergencyBraking"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.emergencyBraking', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.emergencyBraking">System hamowania awaryjnego</label>
          </div>

          <div className="checkbox-group">
            <Field
              name="equipment.startStop"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.startStop"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.startStop', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.startStop">System Start-Stop</label>
          </div>
        </div>
      </div>

      <div className="equipment-section">
        <h3>Oświetlenie</h3>
        <div className="equipment-grid">
          <div className="checkbox-group">
            <Field
              name="equipment.xenonLights"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.xenonLights"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.xenonLights', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.xenonLights">Światła ksenonowe</label>
          </div>

          <div className="checkbox-group">
            <Field
              name="equipment.ledLights"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.ledLights"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.ledLights', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.ledLights">Światła LED</label>
          </div>

          <div className="checkbox-group">
            <Field
              name="equipment.ambientLighting"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.ambientLighting"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.ambientLighting', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.ambientLighting">Oświetlenie ambientowe</label>
          </div>

          <div className="checkbox-group">
            <Field
              name="equipment.automaticLights"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.automaticLights"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.automaticLights', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.automaticLights">Automatyczne światła</label>
          </div>

          <div className="checkbox-group">
            <Field
              name="equipment.adaptiveLights"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.adaptiveLights"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.adaptiveLights', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.adaptiveLights">Adaptacyjne światła</label>
          </div>
        </div>
      </div>

      <div className="equipment-section">
        <h3>Dodatkowe funkcje</h3>
        <div className="equipment-grid">
          <div className="checkbox-group">
            <Field
              name="equipment.heatedSteeringWheel"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.heatedSteeringWheel"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.heatedSteeringWheel', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.heatedSteeringWheel">Podgrzewana kierownica</label>
          </div>

          <div className="checkbox-group">
            <Field
              name="equipment.electricTrunk"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.electricTrunk"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.electricTrunk', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.electricTrunk">Elektryczny bagażnik</label>
          </div>

          <div className="checkbox-group">
            <Field
              name="equipment.electricSunBlind"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.electricSunBlind"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.electricSunBlind', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.electricSunBlind">Elektryczna roleta przeciwsłoneczna</label>
          </div>

          <div className="checkbox-group">
            <Field
              name="equipment.headUpDisplay"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.headUpDisplay"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.headUpDisplay', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.headUpDisplay">Wyświetlacz przezierny (HUD)</label>
          </div>

          <div className="checkbox-group">
            <Field
              name="equipment.aromatherapy"
              render={({ field, form }: FieldRenderProps) => (
                <input
                  type="checkbox"
                  id="equipment.aromatherapy"
                  checked={Boolean(field.value)}
                  onChange={() => form.setFieldValue('equipment.aromatherapy', !field.value)}
                />
              )}
            />
            <label htmlFor="equipment.aromatherapy">System aromaterapii</label>
          </div>
        </div>
      </div>

      <div className="form-navigation">
        <button type="button" className="previous-step-btn" onClick={onPrevious}>
          Wstecz
        </button>
        <button type="button" className="next-step-btn" onClick={onNext}>
          {hasSelectedEquipment() ? 'Dalej' : 'Pomiń wyposażenie'}
        </button>
      </div>

      {hasSelectedEquipment() && (
        <small className="equipment-info">
          Wybrano {Object.values(formik.values.equipment || {}).filter(Boolean).length} elementów
          wyposażenia
        </small>
      )}
    </div>
  );
};

export default EquipmentStep;
