export type RegistrationHotelNames = {
  property_name_mn: string;
  property_name_en: string;
};

const KEY_PREFIX = 'hotel_registration_names_';

function serializeNames(names: RegistrationHotelNames): string {
  return JSON.stringify({
    property_name_mn: names.property_name_mn?.trim() || '',
    property_name_en: names.property_name_en?.trim() || '',
  });
}

function parseStoredNames(raw: string | null): RegistrationHotelNames {
  if (!raw) return { property_name_mn: '', property_name_en: '' };

  try {
    const parsed = JSON.parse(raw) as Partial<RegistrationHotelNames>;
    return {
      property_name_mn: String(parsed.property_name_mn || '').trim(),
      property_name_en: String(parsed.property_name_en || '').trim(),
    };
  } catch {
    return { property_name_mn: '', property_name_en: '' };
  }
}

export function saveRegistrationHotelNames(
  hotelId: string | number,
  names: RegistrationHotelNames,
  registerNo?: string
): void {
  if (typeof window === 'undefined') return;

  const payload = serializeNames(names);
  localStorage.setItem(`${KEY_PREFIX}${hotelId}`, payload);

  const register = registerNo?.trim();
  if (register) {
    localStorage.setItem(`${KEY_PREFIX}reg_${register}`, payload);
  }
}

export function loadRegistrationHotelNames(
  hotelId: string | number,
  registerNo?: string
): RegistrationHotelNames {
  if (typeof window === 'undefined') {
    return { property_name_mn: '', property_name_en: '' };
  }

  const byHotel = parseStoredNames(localStorage.getItem(`${KEY_PREFIX}${hotelId}`));
  if (byHotel.property_name_mn || byHotel.property_name_en) {
    return byHotel;
  }

  const register = registerNo?.trim();
  if (register) {
    return parseStoredNames(localStorage.getItem(`${KEY_PREFIX}reg_${register}`));
  }

  return { property_name_mn: '', property_name_en: '' };
}

export function mergeRegistrationHotelNames(
  fromApi: RegistrationHotelNames,
  fromStorage: RegistrationHotelNames
): RegistrationHotelNames {
  return {
    property_name_mn: fromApi.property_name_mn || fromStorage.property_name_mn,
    property_name_en: fromStorage.property_name_en || fromApi.property_name_en,
  };
}
