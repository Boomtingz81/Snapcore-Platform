// 📂 FILE: src/lib/scans.ts
// Enhanced version with better types, error handling, and additional functionality

import { supabase } from "./supabaseClient";

// Type definitions for better type safety
export interface Customer {
  id: string;
  owner_user_id: string;
  name: string;
  email?: string;
  phone?: string;
  created_at: string;
}

export interface Vehicle {
  id: string;
  customer_id: string;
  vin?: string;
  plate?: string;
  make?: string;
  model?: string;
  year?: number;
  created_at: string;
}

export interface Scan {
  id: string;
  customer_id: string;
  vehicle_id?: string;
  tech_user_id: string;
  entries: any[];
  health?: any;
  started_at: string;
  duration_sec?: number;
  meta?: Record<string, any>;
}

// Input types
export interface CustomerInput {
  name: string;
  email?: string;
  phone?: string;
}

export interface VehicleInput {
  vin?: string;
  plate?: string;
  make?: string;
  model?: string;
  year?: number;
}

export interface ScanInput {
  customerId: string;
  vehicleId?: string | null;
  entries: any[];
  health?: any;
  durationSec?: number;
  meta?: Record<string, any>;
}

// Enhanced error classes for better error handling
export class ScansLibError extends Error {
  constructor(message: string, public code?: string, public details?: any) {
    super(message);
    this.name = 'ScansLibError';
  }
}

export class AuthenticationError extends ScansLibError {
  constructor(message = "Not authenticated") {
    super(message, 'AUTH_ERROR');
  }
}

export class ValidationError extends ScansLibError {
  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', { field });
  }
}

/**
 * Get current authenticated user or throw error
 */
async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw new ScansLibError(`Authentication check failed: ${error.message}`, 'AUTH_CHECK_ERROR');
  if (!user) throw new AuthenticationError();
  return user;
}

/**
 * Validate customer input
 */
function validateCustomerInput(input: CustomerInput): void {
  if (!input.name || input.name.trim().length === 0) {
    throw new ValidationError("Customer name is required", "name");
  }
  
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    throw new ValidationError("Invalid email format", "email");
  }
  
  if (input.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(input.phone.replace(/[-\s\(\)]/g, ''))) {
    throw new ValidationError("Invalid phone format", "phone");
  }
}

/**
 * Validate vehicle input
 */
function validateVehicleInput(input: VehicleInput): void {
  if (input.vin && (input.vin.length !== 17 || !/^[A-HJ-NPR-Z0-9]+$/i.test(input.vin))) {
    throw new ValidationError("Invalid VIN format (must be 17 alphanumeric characters)", "vin");
  }
  
  if (input.year && (input.year < 1900 || input.year > new Date().getFullYear() + 1)) {
    throw new ValidationError("Invalid year", "year");
  }
}

/**
 * Enhanced customer creation with better matching logic
 */
export async function ensureCustomer(input: CustomerInput): Promise<Customer> {
  validateCustomerInput(input);
  const user = await getCurrentUser();

  try {
    // Enhanced matching: try email first, then phone, then name
    let existing: Customer | null = null;

    if (input.email) {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("owner_user_id", user.id)
        .eq("email", input.email)
        .maybeSingle();
      
      if (error) throw error;
      existing = data;
    }

    // If no email match and phone provided, try phone
    if (!existing && input.phone) {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("owner_user_id", user.id)
        .eq("phone", input.phone)
        .maybeSingle();
      
      if (error) throw error;
      existing = data;
    }

    // If no exact match, try fuzzy name match (optional)
    if (!existing && input.name) {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("owner_user_id", user.id)
        .ilike("name", `%${input.name.trim()}%`)
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      // Only use fuzzy match if name is very similar (optional safeguard)
      if (data && data.name.toLowerCase().includes(input.name.toLowerCase())) {
        existing = data;
      }
    }

    if (existing) {
      // Update existing customer with any new information
      const updates: Partial<CustomerInput> = {};
      if (input.email && !existing.email) updates.email = input.email;
      if (input.phone && !existing.phone) updates.phone = input.phone;

      if (Object.keys(updates).length > 0) {
        const { data, error } = await supabase
          .from("customers")
          .update(updates)
          .eq("id", existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
      
      return existing;
    }

    // Create new customer
    const { data, error } = await supabase
      .from("customers")
      .insert([{ 
        owner_user_id: user.id, 
        name: input.name.trim(), 
        email: input.email?.trim() || null, 
        phone: input.phone?.trim() || null 
      }])
      .select()
      .single();

    if (error) throw new ScansLibError(`Failed to create customer: ${error.message}`, 'CREATE_CUSTOMER_ERROR');
    return data;

  } catch (error) {
    if (error instanceof ScansLibError) throw error;
    throw new ScansLibError(`Customer operation failed: ${(error as Error).message}`, 'CUSTOMER_ERROR');
  }
}

/**
 * Enhanced vehicle creation with better validation
 */
export async function ensureVehicle(customerId: string, input?: VehicleInput): Promise<Vehicle | null> {
  if (!input || (!input.vin && !input.plate && !input.make)) {
    return null; // Not enough info to create/find vehicle
  }

  validateVehicleInput(input);

  try {
    // Build query based on available identifiers
    let query = supabase.from("vehicles").select("*").eq("customer_id", customerId);

    // Priority: VIN > Plate > Make+Model+Year combination
    if (input.vin) {
      query = query.eq("vin", input.vin.toUpperCase());
    } else if (input.plate) {
      query = query.eq("plate", input.plate.toUpperCase());
    } else if (input.make && input.model) {
      query = query
        .ilike("make", input.make)
        .ilike("model", input.model);
      if (input.year) {
        query = query.eq("year", input.year);
      }
    }

    const { data: existing, error: findErr } = await query.maybeSingle();
    if (findErr) throw findErr;

    if (existing) {
      // Update existing vehicle with any new information
      const updates: Partial<VehicleInput> = {};
      if (input.vin && !existing.vin) updates.vin = input.vin.toUpperCase();
      if (input.plate && !existing.plate) updates.plate = input.plate.toUpperCase();
      if (input.make && !existing.make) updates.make = input.make;
      if (input.model && !existing.model) updates.model = input.model;
      if (input.year && !existing.year) updates.year = input.year;

      if (Object.keys(updates).length > 0) {
        const { data, error } = await supabase
          .from("vehicles")
          .update(updates)
          .eq("id", existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }

      return existing;
    }

    // Create new vehicle
    const vehicleData = {
      customer_id: customerId,
      vin: input.vin?.toUpperCase() || null,
      plate: input.plate?.toUpperCase() || null,
      make: input.make || null,
      model: input.model || null,
      year: input.year || null,
    };

    const { data, error } = await supabase
      .from("vehicles")
      .insert([vehicleData])
      .select()
      .single();

    if (error) throw new ScansLibError(`Failed to create vehicle: ${error.message}`, 'CREATE_VEHICLE_ERROR');
    return data;

  } catch (error) {
    if (error instanceof ScansLibError) throw error;
    throw new ScansLibError(`Vehicle operation failed: ${(error as Error).message}`, 'VEHICLE_ERROR');
  }
}

/**
 * Enhanced scan saving with validation
 */
export async function saveScan(input: ScanInput): Promise<Scan> {
  // Validate input
  if (!input.customerId) {
    throw new ValidationError("Customer ID is required", "customerId");
  }
  
  if (!input.entries || !Array.isArray(input.entries)) {
    throw new ValidationError("Entries array is required", "entries");
  }

  const user = await getCurrentUser();

  try {
    const scanData = {
      customer_id: input.customerId,
      vehicle_id: input.vehicleId || null,
      tech_user_id: user.id,
      entries: input.entries,
      health: input.health || null,
      duration_sec: input.durationSec || null,
      meta: {
        ...input.meta,
        app_version: process.env.REACT_APP_VERSION || '1.0.0',
        scan_timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
      },
    };

    const { data, error } = await supabase
      .from("scans")
      .insert([scanData])
      .select()
      .single();

    if (error) throw new ScansLibError(`Failed to save scan: ${error.message}`, 'SAVE_SCAN_ERROR');
    return data;

  } catch (error) {
    if (error instanceof ScansLibError) throw error;
    throw new ScansLibError(`Scan save operation failed: ${(error as Error).message}`, 'SCAN_ERROR');
  }
}

/**
 * Get recent scans for a customer
 */
export async function getCustomerScans(customerId: string, limit = 10): Promise<Scan[]> {
  const user = await getCurrentUser();

  try {
    const { data, error } = await supabase
      .from("scans")
      .select(`
        *,
        vehicles (
          make,
          model,
          year,
          plate,
          vin
        )
      `)
      .eq("customer_id", customerId)
      .order("started_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];

  } catch (error) {
    throw new ScansLibError(`Failed to fetch customer scans: ${(error as Error).message}`, 'FETCH_SCANS_ERROR');
  }
}

/**
 * Get scan by ID with related data
 */
export async function getScan(scanId: string): Promise<Scan | null> {
  const user = await getCurrentUser();

  try {
    const { data, error } = await supabase
      .from("scans")
      .select(`
        *,
        customers (
          name,
          email,
          phone
        ),
        vehicles (
          make,
          model,
          year,
          plate,
          vin
        )
      `)
      .eq("id", scanId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;

  } catch (error) {
    throw new ScansLibError(`Failed to fetch scan: ${(error as Error).message}`, 'FETCH_SCAN_ERROR');
  }
}

/**
 * Complete workflow: ensure customer, vehicle, and save scan
 */
export async function saveCompleteScan({
  customer,
  vehicle,
  entries,
  health,
  durationSec,
  meta,
}: {
  customer: CustomerInput;
  vehicle?: VehicleInput;
  entries: any[];
  health?: any;
  durationSec?: number;
  meta?: Record<string, any>;
}): Promise<{ customer: Customer; vehicle: Vehicle | null; scan: Scan }> {
  try {
    // Step 1: Ensure customer exists
    const customerRecord = await ensureCustomer(customer);

    // Step 2: Ensure vehicle exists (if provided)
    const vehicleRecord = vehicle ? await ensureVehicle(customerRecord.id, vehicle) : null;

    // Step 3: Save the scan
    const scanRecord = await saveScan({
      customerId: customerRecord.id,
      vehicleId: vehicleRecord?.id,
      entries,
      health,
      durationSec,
      meta,
    });

    return {
      customer: customerRecord,
      vehicle: vehicleRecord,
      scan: scanRecord,
    };

  } catch (error) {
    if (error instanceof ScansLibError) throw error;
    throw new ScansLibError(`Complete scan save failed: ${(error as Error).message}`, 'COMPLETE_SCAN_ERROR');
  }
}

// Export error classes for use in components
export { ScansLibError, AuthenticationError, ValidationError };
