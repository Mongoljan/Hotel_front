// Hotel-related type definitions

export interface PropertyPhoto {
  id: number;
  image: string;
  description: string;
}

export interface PropertyDetail {
  id: number;
  propertyBasicInfo: number;
  confirmAddress: number;
  propertyPolicies: number;
  google_map: string;
  parking_situation: string;
  property: number;
  general_facilities: number[];
  Additional_Information: number | null;
}

export interface AdditionalInformation {
  id: number;
  About: string;
  YoutubeUrl: string;
}

export interface PropertyPolicy {
  id: number;
  property: number;
  check_in_from: string;
  check_in_until: string;
  check_out_from: string;
  check_out_until: string;
  cancellation_fee: {
    id?: number;
    property: number;
    cancel_time: string;
    single_before_time_percentage: string;
    single_after_time_percentage: string;
    multi_5days_before_percentage: string;
    multi_3days_before_percentage: string;
    multi_2days_before_percentage: string;
    multi_1day_before_percentage: string;
    created_at?: string;
    updated_at?: string;
  } | null;
  breakfast_policy: {
    id?: number;
    status: 'no' | 'free' | 'paid';
    start_time: string | null;
    end_time: string | null;
    price: string | null;
    breakfast_type: 'buffet' | 'room' | 'plate' | null;
  } | null;
  parking_policy: {
    id?: number;
    outdoor_parking: 'no' | 'free' | 'paid';
    outdoor_fee_type: 'hour' | 'day' | null;
    outdoor_price: string | null;
    indoor_parking: 'no' | 'free' | 'paid';
    indoor_fee_type: 'hour' | 'day' | null;
    indoor_price: string | null;
  } | null;
  child_policy: {
    id?: number;
    allow_children: boolean;
    max_child_age: number | null;
    child_bed_available: 'yes' | 'no' | null;
    allow_extra_bed: boolean;
    extra_bed_price: string | null;
  } | null;
}

export interface Address {
  id: number;
  zipCode?: string;
  total_floor_number: number;
  province_city: number;
  soum?: number;
  district?: number;
}

export interface BasicInfo {
  id: number;
  property_name_mn: string;
  property_name_en: string;
  start_date: string;
  total_hotel_rooms: number;
  available_rooms: number;
  star_rating: number;
  part_of_group: boolean;
  group_name?: string;
  sales_room_limitation: boolean;
  languages: number[];
}

export interface PropertyBaseInfo {
  pk: number;
  register: string;
  CompanyName: string;
  PropertyName: string;
  location: string;
  property_type: number;
  phone: string;
  mail: string;
  is_approved: boolean;
  created_at: string;
  groupName?: string;
}

export interface Province {
  id: number;
  name: string;
}

export interface Soum {
  id: number;
  name: string;
  code: number;
}

export interface District {
  id: number;
  name: string;
  code: number;
}

export interface PropertyType {
  id: number;
  name_en: string;
  name_mn: string;
}
