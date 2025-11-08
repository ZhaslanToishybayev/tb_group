export class ValidationUtils {
  // Email validation
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Phone validation (basic)
  isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  // URL validation
  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // String validation
  isValidString(str: string, minLength: number = 0, maxLength: number = Infinity): boolean {
    return typeof str === 'string' &&
           str.length >= minLength &&
           str.length <= maxLength;
  }

  // Object validation
  isValidObject(obj: any, requiredFields: string[]): boolean {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }

    return requiredFields.every(field => obj.hasOwnProperty(field));
  }

  // Array validation
  isValidArray(arr: any, minLength: number = 0, maxLength: number = Infinity): boolean {
    return Array.isArray(arr) &&
           arr.length >= minLength &&
           arr.length <= maxLength;
  }

  // Numeric validation
  isValidNumber(num: any, min: number = -Infinity, max: number = Infinity): boolean {
    return typeof num === 'number' &&
           !isNaN(num) &&
           num >= min &&
           num <= max;
  }

  // Integer validation
  isValidInteger(num: any, min: number = -Infinity, max: number = Infinity): boolean {
    return Number.isInteger(num) &&
           num >= min &&
           num <= max;
  }

  // Boolean validation
  isValidBoolean(bool: any): boolean {
    return typeof bool === 'boolean';
  }

  // Date validation
  isValidDate(date: any): boolean {
    return date instanceof Date ||
           (!isNaN(Date.parse(date)) &&
           typeof date === 'string');
  }

  // Slug validation
  isValidSlug(slug: string): boolean {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug);
  }

  // Password validation (basic strength check)
  isValidPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  // Sanitization helpers
  sanitizeString(str: string): string {
    return str.trim().replace(/\s+/g, ' ');
  }

  sanitizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  sanitizePhone(phone: string): string {
    return phone.replace(/[^\d\+]/g, '');
  }

  // XSS prevention
  sanitizeHtml(html: string): string {
    return html
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Validation error formatters
  formatValidationError(field: string, rule: string, message?: string): any {
    return {
      field,
      rule,
      message: message || `Validation failed for field ${field} with rule ${rule}`,
    };
  }

  // Object validation with custom rules
  validateObject(obj: any, schema: Record<string, any>): { isValid: boolean; errors: any[] } {
    const errors: any[] = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = obj[field];

      // Required check
      if (rules.required && (value === undefined || value === null)) {
        errors.push(this.formatValidationError(field, 'required'));
        continue;
      }

      // Skip other validations if field is not required and empty
      if (!rules.required && (value === undefined || value === null)) {
        continue;
      }

      // Type validation
      if (rules.type) {
        switch (rules.type) {
          case 'string':
            if (!this.isValidString(value, rules.minLength, rules.maxLength)) {
              errors.push(this.formatValidationError(field, 'string'));
            }
            break;
          case 'email':
            if (!this.isValidEmail(value)) {
              errors.push(this.formatValidationError(field, 'email'));
            }
            break;
          case 'phone':
            if (!this.isValidPhone(value)) {
              errors.push(this.formatValidationError(field, 'phone'));
            }
            break;
          case 'url':
            if (!this.isValidUrl(value)) {
              errors.push(this.formatValidationError(field, 'url'));
            }
            break;
          case 'number':
            if (!this.isValidNumber(value, rules.min, rules.max)) {
              errors.push(this.formatValidationError(field, 'number'));
            }
            break;
          case 'integer':
            if (!this.isValidInteger(value, rules.min, rules.max)) {
              errors.push(this.formatValidationError(field, 'integer'));
            }
            break;
          case 'boolean':
            if (!this.isValidBoolean(value)) {
              errors.push(this.formatValidationError(field, 'boolean'));
            }
            break;
          case 'array':
            if (!this.isValidArray(value, rules.minLength, rules.maxLength)) {
              errors.push(this.formatValidationError(field, 'array'));
            }
            break;
          case 'date':
            if (!this.isValidDate(value)) {
              errors.push(this.formatValidationError(field, 'date'));
            }
            break;
          case 'slug':
            if (!this.isValidSlug(value)) {
              errors.push(this.formatValidationError(field, 'slug'));
            }
            break;
          case 'password':
            if (!this.isValidPassword(value)) {
              errors.push(this.formatValidationError(field, 'password'));
            }
            break;
        }
      }

      // Custom validator
      if (rules.validator && !rules.validator(value)) {
        errors.push(this.formatValidationError(field, 'custom'));
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Common validation schemas
  getServiceSchema() {
    return {
      title: {
        required: true,
        type: 'string',
        minLength: 3,
        maxLength: 255,
      },
      description: {
        required: true,
        type: 'string',
        minLength: 10,
        maxLength: 2000,
      },
      icon: {
        required: true,
        type: 'string',
        maxLength: 100,
      },
      order: {
        required: true,
        type: 'integer',
        min: 0,
      },
      isPublished: {
        required: true,
        type: 'boolean',
      },
    };
  }

  getContactSchema() {
    return {
      name: {
        required: true,
        type: 'string',
        minLength: 2,
        maxLength: 100,
      },
      email: {
        required: true,
        type: 'email',
      },
      phone: {
        required: false,
        type: 'phone',
      },
      company: {
        required: false,
        type: 'string',
        maxLength: 255,
      },
      message: {
        required: true,
        type: 'string',
        minLength: 10,
        maxLength: 2000,
      },
    };
  }

  getUserSchema() {
    return {
      email: {
        required: true,
        type: 'email',
      },
      password: {
        required: true,
        type: 'password',
      },
      role: {
        required: true,
        type: 'string',
        validator: (value: string) => ['admin', 'user'].includes(value),
      },
    };
  }
}