import { z } from 'zod';

// ============================================================================
// COMPREHENSIVE INPUT VALIDATION FOR SECURITY
// ============================================================================

// Financial data validation schemas
export const financialAmountSchema = z
  .string()
  .regex(/^[\$,0-9\.]+$/, "Invalid financial amount format")
  .refine((val) => {
    const numericValue = parseFloat(val.replace(/[$,]/g, ''));
    return numericValue >= 0 && numericValue <= 999999999;
  }, "Amount must be between $0 and $999,999,999");

export const creditScoreSchema = z
  .string()
  .regex(/^[0-9]+$/, "Credit score must be numeric")
  .refine((val) => {
    const score = parseInt(val);
    return score >= 300 && score <= 850;
  }, "Credit score must be between 300 and 850");

// Personal information validation schemas
export const emailSchema = z
  .string()
  .email("Invalid email address")
  .max(255, "Email must be less than 255 characters")
  .toLowerCase();

export const phoneSchema = z
  .string()
  .regex(/^[\+]?[0-9\s\-\(\)\.]{10,20}$/, "Invalid phone number format")
  .optional();

export const nameSchema = z
  .string()
  .min(1, "Name cannot be empty")
  .max(100, "Name must be less than 100 characters")
  .regex(/^[a-zA-Z\s\'\-\.]+$/, "Name contains invalid characters");

// Property and address validation
export const addressSchema = z
  .string()
  .min(5, "Address must be at least 5 characters")
  .max(200, "Address must be less than 200 characters")
  .refine((val) => !/<script|javascript:|on\w+=/i.test(val), "Invalid characters in address");

// Content validation for posts and descriptions
export const contentSchema = z
  .string()
  .min(1, "Content cannot be empty")
  .max(2000, "Content must be less than 2000 characters")
  .refine((val) => !/<script|javascript:|on\w+=/i.test(val), "Content contains invalid characters");

// URL validation for LinkedIn profiles, etc.
export const urlSchema = z
  .string()
  .url("Invalid URL format")
  .max(500, "URL must be less than 500 characters")
  .optional();

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

export const validateFinancialData = (data: Record<string, unknown>) => {
  const errors: string[] = [];

  // Validate financial amounts
  ['funding_amount', 'annual_income', 'bank_balance', 'current_value', 'arv_estimate', 'rehab_costs'].forEach(field => {
    if (data[field] && typeof data[field] === 'string') {
      const result = financialAmountSchema.safeParse(data[field]);
      if (!result.success) {
        errors.push(`${field}: ${result.error.errors[0].message}`);
      }
    }
  });

  // Validate credit score
  if (data.credit_score && typeof data.credit_score === 'string') {
    const result = creditScoreSchema.safeParse(data.credit_score);
    if (!result.success) {
      errors.push(`Credit score: ${result.error.errors[0].message}`);
    }
  }

  return errors;
};

export const validatePersonalData = (data: Record<string, unknown>) => {
  const errors: string[] = [];

  // Validate email
  if (data.email && typeof data.email === 'string') {
    const result = emailSchema.safeParse(data.email);
    if (!result.success) {
      errors.push(`Email: ${result.error.errors[0].message}`);
    }
  }

  // Validate names
  ['first_name', 'last_name', 'display_name'].forEach(field => {
    if (data[field] && typeof data[field] === 'string') {
      const result = nameSchema.safeParse(data[field]);
      if (!result.success) {
        errors.push(`${field}: ${result.error.errors[0].message}`);
      }
    }
  });

  // Validate phone
  if (data.phone && typeof data.phone === 'string') {
    const result = phoneSchema.safeParse(data.phone);
    if (!result.success) {
      errors.push(`Phone: ${result.error.errors[0].message}`);
    }
  }

  // Validate LinkedIn profile URL
  if (data.linkedin_profile && typeof data.linkedin_profile === 'string') {
    const result = urlSchema.safeParse(data.linkedin_profile);
    if (!result.success) {
      errors.push(`LinkedIn profile: ${result.error.errors[0].message}`);
    }
  }

  return errors;
};

export const validatePropertyData = (data: Record<string, unknown>) => {
  const errors: string[] = [];

  // Validate property address
  if (data.property_address && typeof data.property_address === 'string') {
    const result = addressSchema.safeParse(data.property_address);
    if (!result.success) {
      errors.push(`Property address: ${result.error.errors[0].message}`);
    }
  }

  return errors;
};

export const validateContent = (content: string) => {
  const result = contentSchema.safeParse(content);
  return result.success ? [] : result.error.errors.map(e => e.message);
};

// ============================================================================
// SANITIZATION FUNCTIONS
// ============================================================================

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
};

export const sanitizeFinancialAmount = (amount: string): string => {
  return amount.replace(/[^$0-9,\.]/g, '');
};

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

// ============================================================================
// SECURITY LOGGING (for sensitive operations)
// ============================================================================

export const logSecurityEvent = (event: string, details?: Record<string, unknown>) => {
  // Only log in development or when specifically enabled
  if (process.env.NODE_ENV === 'development') {
    console.log(`SECURITY EVENT: ${event}`, details);
  }
  
  // In production, this could be sent to a security monitoring service
  // Never log actual sensitive data, only metadata
};