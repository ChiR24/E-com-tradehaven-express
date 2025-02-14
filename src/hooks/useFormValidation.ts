import { useState, useCallback } from 'react';

interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

interface Validations {
  [key: string]: ValidationRules;
}

interface FormErrors {
  [key: string]: string | null;
}

export function useFormValidation<T extends { [key: string]: string }>(
  initialValues: T,
  validations: Validations
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isValid, setIsValid] = useState(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateField = useCallback(
    (name: string, value: string): string | null => {
      const rules = validations[name];
      if (!rules) return null;

      if (rules.required && !value) {
        return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
      }

      if (rules.minLength && value.length < rules.minLength) {
        return `${name.charAt(0).toUpperCase() + name.slice(1)} must be at least ${rules.minLength} characters`;
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        return `${name.charAt(0).toUpperCase() + name.slice(1)} must be less than ${rules.maxLength} characters`;
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        return `${name.charAt(0).toUpperCase() + name.slice(1)} format is invalid`;
      }

      if (rules.custom) {
        return rules.custom(value);
      }

      return null;
    },
    [validations]
  );

  const validateForm = useCallback(() => {
    const newErrors: FormErrors = {};
    let formIsValid = true;

    Object.keys(values).forEach((name) => {
      const error = validateField(name, values[name]);
      if (error) {
        formIsValid = false;
        newErrors[name] = error;
      }
    });

    setErrors(newErrors);
    setIsValid(formIsValid);
    return formIsValid;
  }, [validateField, values]);

  const handleChange = useCallback(
    (name: keyof T, value: string) => {
      setValues((prev) => ({ ...prev, [name]: value }));
      setTouched((prev) => ({ ...prev, [name]: true }));
      const error = validateField(name as string, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [validateField]
  );

  const handleBlur = useCallback(
    (name: keyof T) => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      const error = validateField(name as string, values[name]);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [validateField, values]
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsValid(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
  };
} 