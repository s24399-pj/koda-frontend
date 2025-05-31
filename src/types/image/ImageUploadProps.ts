import { FormikProps } from 'formik';
import {OfferFormValues} from "../offer/OfferTypes.ts";

export interface ImageUploadProps {
    formik: FormikProps<OfferFormValues>;
}