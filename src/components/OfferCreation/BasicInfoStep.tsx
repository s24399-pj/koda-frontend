import React from 'react';
import { FormikProps, Field, ErrorMessage } from 'formik';
import { OfferFormValues } from '../../types/offer/OfferTypes';
import ImageUpload from './ImageUpload';

interface BasicInfoStepProps {
  formik: FormikProps<OfferFormValues>;
  onNext: () => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ formik, onNext }) => {
  const handleNext = () => {
    formik.validateForm().then(errors => {
      formik.setTouched({
        title: true,
        description: true,
        price: true,
        currency: true,
        imageFiles: true,
      } as any);

      const stepErrors = Object.keys(errors).filter(key =>
        ['title', 'description', 'price', 'currency', 'imageFiles'].includes(key)
      );

      if (stepErrors.length === 0) {
        onNext();
      } else {
        const firstErrorField = document.getElementById(stepErrors[0]);
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstErrorField.focus();
        }
      }
    });
  };

  const calculateTitleChars = () => formik.values.title?.length || 0;
  const calculateDescriptionChars = () => formik.values.description?.length || 0;

  return (
    <div className="form-step">
      <h2>Podstawowe informacje o ofercie</h2>

      <ImageUpload formik={formik} />

      <div className="form-group">
        <label htmlFor="title">Tytuł ogłoszenia *</label>
        <Field
          type="text"
          id="title"
          name="title"
          placeholder="Np. BMW Seria 3 318i, 2020, Salon Polska"
          className={formik.touched.title && formik.errors.title ? 'error' : ''}
          maxLength={100}
        />
        <ErrorMessage name="title" component="div" className="error-text" />
        <small className={calculateTitleChars() >= 90 ? 'char-count warning' : 'char-count'}>
          {calculateTitleChars()}/100 znaków
        </small>
      </div>

      <div className="form-group">
        <label htmlFor="description">Opis ogłoszenia *</label>
        <Field
          as="textarea"
          id="description"
          name="description"
          placeholder="Opisz dokładnie swój samochód. Wymień jego zalety, historię, stan techniczny i wszystko co może zainteresować potencjalnych kupujących."
          rows={10}
          className={formik.touched.description && formik.errors.description ? 'error' : ''}
          maxLength={2000}
        />
        <ErrorMessage name="description" component="div" className="error-text" />
        <small
          className={calculateDescriptionChars() >= 1900 ? 'char-count warning' : 'char-count'}
        >
          {calculateDescriptionChars()}/2000 znaków
        </small>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="price">Cena *</label>
          <Field
            type="number"
            id="price"
            name="price"
            placeholder="Cena"
            min="1"
            step="0.01"
            className={formik.touched.price && formik.errors.price ? 'error' : ''}
          />
          <ErrorMessage name="price" component="div" className="error-text" />
        </div>

        <div className="form-group">
          <label htmlFor="currency">Waluta *</label>
          <Field
            as="select"
            id="currency"
            name="currency"
            className={formik.touched.currency && formik.errors.currency ? 'error' : ''}
          >
            <option value="PLN">PLN</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </Field>
          <ErrorMessage name="currency" component="div" className="error-text" />
        </div>
      </div>

      <div className="form-group checkbox-group">
        <Field type="checkbox" id="negotiable" name="negotiable" />
        <label htmlFor="negotiable">Cena do negocjacji</label>
      </div>

      <div className="form-navigation">
        <button type="button" className="next-step-btn" onClick={handleNext}>
          Dalej
        </button>
      </div>
    </div>
  );
};

export default BasicInfoStep;
