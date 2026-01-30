import { z } from "zod";
// import { t } from "i18next";
//* FILE 1mb max, bas pdf Baih validation
const MAX_FILE_SIZE = 1024 * 1024; // 1MB in bytes
const ACCEPTED_FILE_TYPES = ["application/pdf"];
const fileValidation = z
.instanceof(File)
.refine((file) => file.size <= MAX_FILE_SIZE, {
  message: "Admin_File"
})
.refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), {
  message: "Admin_PDF"
});

export const schemaConfirmationNumber = z.object({
confirmationNumber: z
  .number() // Force it to be a number
  .int() // Make sure it's an integer
  .gte(10000) // Greater than or equal to the smallest 5 digit int
  .lte(99999), // Less than or equal to the largest 5 digit int
});

export const schemaUserLogin = z.object({
email: z
  .string()
  .email({ message: "schemas_emailformat"})
  .max(255, { message: "schemas_emailcannotbe255" }),
password: z.string().min(1, { message: "schemas_enteremail"}),
// .max(100, { message: "Нууц үг 100 тэмдэгтээс их байж болохгүй" })
// .regex(/[a-z]/, {
//   message: "Password must contain at least one lowercase letter",
// }) // Lowercase letter
// .regex(/[A-Z]/, {
//   message: "Password must contain at least one uppercase letter",
// }) // Uppercase letter
// .regex(/\d/, { message: "Password must contain at least one number" }) // Number
// .regex(/[@$!%*?&#]/, {
//   message: "Password must contain at least one special character",
// }), // Special character
});
export const schemaOnlyEmail = z.object({
email: z.string().email({ message:"schemas_emailformat"}),
});
const urlValidation = z.string().url({ message: "Invalid URL format" });
export const schemaLogin = z.object({
    email: z
      .string()
      .min(1, { message: 'email_required' })
      .email({ message: 'email_invalid' }),
    password: z.string().min(1, { message: 'password_required' }),
  });


export const schemaCreateRoom = z.object({
  entries: z.array(
    z.object({
      images: z.string(),
      descriptions: z.string(), // Allow empty strings for descriptions
    })
  )
  .refine(
    (entries) => {
      // At least one entry must have a valid image
      return entries.some(entry => {
        const img = entry.images.trim();
        return img.length > 0 && (
          img.startsWith('http://') || 
          img.startsWith('https://') || 
          img.startsWith('data:image/')
        );
      });
    },
    { message: 'At least one valid image is required.' }
  ),
    // room_number: z.string().min(1, { message: "Room number is required" }),
    room_type: z.string().min(1, { message: "Room type is required" }),
    room_category:  z.string().min(1, { message: "Room category is required" }),
    room_size: z.string().min(1, { message: "Room size must be at least 5m²" }),
    // New: room_beds array for multiple bed types with quantities
    room_beds: z.array(
      z.object({
        bed_type: z.string().min(1, { message: "Bed type is required" }),
        quantity: z.number().min(1, { message: "Quantity must be at least 1" }),
      })
    ).min(1, { message: "At least one bed type is required" }),
    is_Bathroom: z.string().min(1, { message: "Нэгийг сонгонo уу?"}),
    room_Facilities: z.array(z.string()).min(1, { message: "Select at least one facility" }),
    bathroom_Items: z.array(z.string()).min(1, { message: "Select at least one facility" }),
    free_Toiletries: z.array(z.string()).min(1, { message: "Select at least one facility" }),
    food_And_Drink: z.array(z.string()).min(1, { message: "Select at least one facility" }),
    outdoor_And_View: z.array(z.string()).min(1, { message: "Select at least one facility" }),
    adultQty: z.string().min(1,{message:"Орох насанд хүрсэн хүний тоог оруулна уу?"}),
        childQty: z.string().min(1,{message:"Орох хүүхдийн тоог оруулна уу?"}),
    number_of_rooms: z.preprocess(
      (val) => Number(val), // Convert input to number
      z.number()
        .int({ message: "Must be a whole number" }) // Ensures it's an integer
        .min(1, { message: "Must be a natural number (1 or greater)" }) // Ensures it's ≥ 1
    ),
    
    number_of_rooms_to_sell: z.string().min(1, { message: "Rooms to sell is required" })
        .regex(/^\d+$/, { message: "Must be a valid number" }),
    room_Description: z.string().min(5, { message: "Description is required" }),
    smoking_allowed: z.string().min(1, { message: "Нэгийг сонгонo уу?"}),
    RoomNo: z.string().min(1, { message: "Enter valid room numbers" }),
}).refine((data) => {
    return parseInt(data.number_of_rooms_to_sell, 10) <= data.number_of_rooms;
}, {
    message: "Rooms to sell cannot exceed total number of rooms",
    path: ["number_of_rooms_to_sell"], // Attach error to this field
});

// Simplified schema for addToGroupMode - only validates room numbers and counts
export const schemaAddToGroup = z.object({
  RoomNo: z.string().min(1, { message: "Enter valid room numbers" }),
  number_of_rooms: z.preprocess(
    (val) => Number(val),
    z.number()
      .int({ message: "Must be a whole number" })
      .min(1, { message: "Must be a natural number (1 or greater)" })
  ),
  number_of_rooms_to_sell: z.string().min(1, { message: "Rooms to sell is required" })
    .regex(/^\d+$/, { message: "Must be a valid number" }),
  // Include other fields as optional so we can pass them through
  room_type: z.string().optional(),
  room_category: z.string().optional(),
  room_size: z.string().optional(),
  room_beds: z.array(z.object({
    bed_type: z.string(),
    quantity: z.number(),
  })).optional(),
  is_Bathroom: z.string().optional(),
  room_Facilities: z.array(z.string()).optional(),
  bathroom_Items: z.array(z.string()).optional(),
  free_Toiletries: z.array(z.string()).optional(),
  food_And_Drink: z.array(z.string()).optional(),
  outdoor_And_View: z.array(z.string()).optional(),
  adultQty: z.string().optional(),
  childQty: z.string().optional(),
  room_Description: z.string().optional(),
  smoking_allowed: z.string().optional(),
  entries: z.array(z.object({
    images: z.string(),
    descriptions: z.string(),
  })).optional(),
}).refine((data) => {
  return parseInt(data.number_of_rooms_to_sell, 10) <= data.number_of_rooms;
}, {
  message: "Rooms to sell cannot exceed total number of rooms",
  path: ["number_of_rooms_to_sell"],
});

export const schemaRegistration = z
.object({
  email: z
    .string()
    .email({ message:"Email format is invalid"})
    .max(255, { message: "Email address cannot exceed 255 characters"}),
  contact_person_name: z
    .string()
    .min(3, { message: "Холбоо барих хүний нэр" }),
    hotel_name: z
    .string()
    .min(3, { message: "Зочид буудлын нэр" }),
    // google_map_address: urlValidation,
    address_location: z
    .string()
    .min(3, { message: "Зочид буудлын хаяг" }),
  contact_number: z
    .string()
    .min(3, { message: "Гар утасны дугаар багадаа 3 оронтой байна."}),
  password: z
    .string()
    .min(8, {
      message:
       "The password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    })
    .max(100, {
      message:
      "The password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    })
    .regex(/[a-z]/, {
      message:
      
      "The password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    }) // Lowercase letter
    .regex(/[A-Z]/, {
      message:
      "The password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    }) // Uppercase letter
    .regex(/\d/, {
      message:
      "The password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    }) // Number
    .regex(/[@$!%*;?&#]/, {
      message:
      "The password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    }), // Special character
  // .min(8, { message: "Нууц үг дор хаяж 8 тэмдэгтийн урттай байна" })
  // .max(100, { message: "Нууц үг 100 тэмдэгтээс их байж болохгүй" })
  // .regex(/[a-z]/, {
  //   message: "Password must contain at least one lowercase letter",
  // }) // Lowercase letter
  // .regex(/[A-Z]/, {
  //   message: "Password must contain at least one uppercase letter",
  // }) // Uppercase letter
  // .regex(/\d/, { message: "Password must contain at least one number" }) // Number
  // .regex(/[@$!%*;?&#]/, {
  //   message: "Password must contain at least one special character",
  // }), // Special character
  confirmPassword: z.string().min(8, {
    message: "The password must be at least 8 characters long",
  }),
})

export const schemaHotelRegistration = z.object({
  email: z
    .string()
    .email({ message: "Email format is invalid" })
    .max(255, { message: "Email address cannot exceed 255 characters" }),
  hotel_name: z
    .string()
    .min(3, { message: "Зочид буудлын нэр 3-аас дээш тэмдэгттэй байх ёстой" }),
  contact_number: z
    .string()
    .min(3, { message: "Гар утасны дугаар багадаа 3 оронтой байна." }),
  address: z
    .string()
    .min(3, { message: "Зочид буудлын хаяг 3-аас дээш тэмдэгттэй байх ёстой" }),
  map_url: z
    .string()
    .max(200, {message :"Google map дээрээс хийсэн холбоос нь 200 тэмдэгтээс урт байх ёсгүй"})
    .url({ message: "Газрын зургийн холбоос буруу байна" }),
  gst_number: z.string().min(3, { message: "must be include gst"}),
  food_gst_percentage: z.string().min(1, {message :" must include food gst"}),
  room_gst_percentage: z.string().min( 1, {message:"must include room gst"}),
  // joined_date: z.string(),
});

export const schemaHotelRegistration2 = z.object({
  register: z
    .string()
    .refine((val) => {
      const firstTwo = val.slice(0, 2);
      const isMongolianLetters = /^[А-ЯӨҮа-яөү]{2}$/.test(firstTwo); // Only Mongolian

      if (isMongolianLetters) {
        // Must be 2 Mongolian letters + 9 digits = 11 total
        return /^[А-ЯӨҮа-яөү]{2}\d{8}$/.test(val);
      } else {
        // Must be exactly 7 digits
        return /^\d{7}$/.test(val);
      }
    }, {
      message: "РД буруу байна. Эхний 2 үсэг монгол байх ба 10 оронтой, эсвэл 7 оронтой тоо байх ёстой.",
    }),
  CompanyName: z
    .string()
    .min(7, { message: "ААН-н нэрийг оруулна уу?" }),
  PropertyName: z
    .string()
    .min(3, { message: "Буудлын нэрийг оруулна уу?" }),
  location: z
    .string()
    .min(3, { message: "Та хаягаа бичиж оруулна уу?" }),
  property_type: z
    .string()
    .min(1, { message: "Буудлын төрлийг сонгоно уу?" }),
  phone: z
    .string()
    .min(8, { message: "Гар утасны дугаарыг оруулна уу?" }),
  mail: z
    .string()
    .email({ message: "И-мэйл хаяг буруу байна" }),
});


export const schemaHotelSteps1 = z
  .object({
    property_name_mn: z
      .string()
      .min(1, { message: "Монгол нэрийг оруулна уу." })
      .regex(/^[А-Яа-яӨөҮүЁё0-9\s.,'-]+$/, {
        message: "Зөвхөн кирилл үсэг ашиглана уу. Латин үсэг оруулсан байна.",
      }),

    property_name_en: z
      .string()
      .min(1, { message: "Англи нэрийг оруулна уу." })
      .regex(/^[A-Za-z0-9\s.,'-]+$/, {
        message: "Зөвхөн латин үсэг ашиглана уу. Кирилл үсэг оруулсан байна.",
      }),

    start_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Эхлэх огноо буруу байна",
    }),

    star_rating: z
      .string()
      .min(1, { message: "Одны зэрэглэл хамгийн багадаа 1 байх ёстой" })
      .max(5, { message: "Одны зэрэглэл хамгийн ихдээ 5 байх ёстой" }),

    part_of_group: z.coerce.boolean(),

    group_name: z.string().optional(),

    total_hotel_rooms: z
      .coerce.string()
      .min(1, { message: "Нийт өрөөний тоо хамгийн багадаа 1 байх ёстой" }),

    available_rooms: z
      .coerce.string()
      .min(1, { message: "Боломжит өрөөний тоог оруулна уу?" }),

    sales_room_limitation: z.coerce.boolean(),

    languages: z
      .array(z.string())
      .min(1, { message: "Хамгийн багадаа нэг хэл сонгоно уу" }),
  })
  .refine(
    (data) => {
      const total = parseInt(data.total_hotel_rooms);
      const available = parseInt(data.available_rooms);
      return !isNaN(total) && !isNaN(available) && available <= total;
    },
    {
      message: "Боломжит өрөөний тоо нь нийт өрөөний тооноос их байж болохгүй.",
      path: ["available_rooms"],
    }
  )
  .superRefine((data, ctx) => {
    if (data.part_of_group && (!data.group_name || data.group_name.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Бүлгийн нэрийг заавал оруулна уу.",
        path: ["group_name"],
      });
    }
  });


export const schemaHotelSteps2 = z.object({
  zipCode: z
    .string()
    .optional()
    .default('00000'),

  total_floor_number: z
    .coerce.number()
    .int({ message: "Бүхэл тоо байх ёстой" })
    .min(1, { message: "Барилгын давхарын тоо хамгийн багадаа 1 байх ёстой" }),

  province_city: z
    .coerce.string()
    .min(1, { message: "Хот/аймгийн мэдээллийг оруулна уу" }),

  soum: z
    .coerce.string()
    .min(1, { message: "Сум/дүүргийн мэдээллийг оруулна уу" }),

  district: z
    .coerce.number()
    .int({ message: "Бүхэл тоо байх ёстой" })
    .min(1, { message: "Баг/Хорооны мэдээллийг оруулна уу" })
});


export const schemaHotelSteps3 = z.object({
  // Check-in/Check-out times with proper time format validation
  check_in_from: z.string()
    .min(1, { message: "Бүртгэх цагийн эхлэх хугацааг сонгоно уу" })
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Цагийн формат буруу байна (ЦЦ:ММ)" }),
  check_in_until: z.string()
    .min(1, { message: "Бүртгэх цагийн дуусах хугацааг сонгоно уу" })
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Цагийн формат буруу байна (ЦЦ:ММ)" }),
  check_out_from: z.string()
    .min(1, { message: "Гарах цагийн эхлэх хугацааг сонгоно уу" })
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Цагийн формат буруу байна (ЦЦ:ММ)" }),
  check_out_until: z.string()
    .min(1, { message: "Гарах цагийн дуусах хугацааг сонгоно уу" })
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Цагийн формат буруу байна (ЦЦ:ММ)" }),

  // Cancellation fee with number validation and percentage range (natural numbers only)
  cancel_time: z.string()
    .min(1, { message: "Цуцлах боломжтой цагийг сонгоно уу" })
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Цагийн формат буруу байна (ЦЦ:ММ)" }),
  single_before_time_percentage: z.string()
    .min(1, { message: "Хувийг оруулна уу" })
    .regex(/^[0-9]+$/, { message: "Зөвхөн эерэг бүхэл тоо оруулна уу" })
    .refine((val) => {
      const num = parseInt(val, 10);
      return num >= 0 && num <= 100;
    }, { message: "Хувь 0-100 хооронд байх ёстой" }),
  single_after_time_percentage: z.string()
    .min(1, { message: "Хувийг оруулна уу" })
    .regex(/^[0-9]+$/, { message: "Зөвхөн эерэг бүхэл тоо оруулна уу" })
    .refine((val) => {
      const num = parseInt(val, 10);
      return num >= 0 && num <= 100;
    }, { message: "Хувь 0-100 хооронд байх ёстой" }),
  multi_5days_before_percentage: z.string()
    .min(1, { message: "Хувийг оруулна уу" })
    .regex(/^[0-9]+$/, { message: "Зөвхөн эерэг бүхэл тоо оруулна уу" })
    .refine((val) => {
      const num = parseInt(val, 10);
      return num >= 0 && num <= 100;
    }, { message: "Хувь 0-100 хооронд байх ёстой" }),
  multi_3days_before_percentage: z.string()
    .min(1, { message: "Хувийг оруулна уу" })
    .regex(/^[0-9]+$/, { message: "Зөвхөн эерэг бүхэл тоо оруулна уу" })
    .refine((val) => {
      const num = parseInt(val, 10);
      return num >= 0 && num <= 100;
    }, { message: "Хувь 0-100 хооронд байх ёстой" }),
  multi_2days_before_percentage: z.string()
    .min(1, { message: "Хувийг оруулна уу" })
    .regex(/^[0-9]+$/, { message: "Зөвхөн эерэг бүхэл тоо оруулна уу" })
    .refine((val) => {
      const num = parseInt(val, 10);
      return num >= 0 && num <= 100;
    }, { message: "Хувь 0-100 хооронд байх ёстой" }),
  multi_1day_before_percentage: z.string()
    .min(1, { message: "Хувийг оруулна уу" })
    .regex(/^[0-9]+$/, { message: "Зөвхөн эерэг бүхэл тоо оруулна уу" })
    .refine((val) => {
      const num = parseInt(val, 10);
      return num >= 0 && num <= 100;
    }, { message: "Хувь 0-100 хооронд байх ёстой" }),

  // Breakfast policy
  breakfast_status: z.enum(['no', 'free', 'paid']),
  breakfast_start_time: z.string().optional(),
  breakfast_end_time: z.string().optional(),
  breakfast_price: z.string().nullable().optional(),
  breakfast_type: z.enum(['buffet', 'room', 'plate']).optional(),

  // Parking policy
  outdoor_parking: z.enum(['no', 'free', 'paid']),
  outdoor_fee_type: z.enum(['hour', 'day']).nullable().optional(),
  outdoor_price: z.string().nullable().optional(),
  indoor_parking: z.enum(['no', 'free', 'paid']),
  indoor_fee_type: z.enum(['hour', 'day']).nullable().optional(),
  indoor_price: z.string().nullable().optional(),

  // Child policy
  allow_children: z.boolean(),
  max_child_age: z.number()
    .min(0, { message: "Хүүхдийн нас 0-с их байх ёстой" })
    .max(18, { message: "Хүүхдийн нас 18-аас бага байх ёстой" })
    .optional(),
  child_bed_available: z.enum(['yes', 'no']).optional(),
  allow_extra_bed: z.boolean().optional(),
  extra_bed_price: z.string().nullable().optional(),
}).refine((data) => {
  // Validate breakfast times when breakfast is not 'no'
  if (data.breakfast_status !== 'no') {
    if (!data.breakfast_start_time || !data.breakfast_end_time) {
      return false;
    }
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(data.breakfast_start_time) && timeRegex.test(data.breakfast_end_time);
  }
  return true;
}, {
  message: "Өглөөний цайны цагийг зөв оруулна уу",
  path: ["breakfast_start_time"],
}).refine((data) => {
  // Validate breakfast type when breakfast is not 'no'
  if (data.breakfast_status !== 'no' && !data.breakfast_type) {
    return false;
  }
  return true;
}, {
  message: "Өглөөний цайны төрлийг сонгоно уу",
  path: ["breakfast_type"],
}).refine((data) => {
  // Validate breakfast price when breakfast is 'paid'
  if (data.breakfast_status === 'paid') {
    if (!data.breakfast_price) return false;
    const price = parseFloat(data.breakfast_price);
    return !isNaN(price) && price > 0;
  }
  return true;
}, {
  message: "Өглөөний цайны үнийг оруулна уу",
  path: ["breakfast_price"],
}).refine((data) => {
  // Validate outdoor parking price when outdoor parking is 'paid'
  if (data.outdoor_parking === 'paid') {
    if (!data.outdoor_fee_type) return false;
    if (!data.outdoor_price) return false;
    const price = parseFloat(data.outdoor_price);
    return !isNaN(price) && price > 0;
  }
  return true;
}, {
  message: "Гадна зогсоолын төлбөрийн мэдээллийг бүрэн оруулна уу",
  path: ["outdoor_price"],
}).refine((data) => {
  // Validate indoor parking price when indoor parking is 'paid'
  if (data.indoor_parking === 'paid') {
    if (!data.indoor_fee_type) return false;
    if (!data.indoor_price) return false;
    const price = parseFloat(data.indoor_price);
    return !isNaN(price) && price > 0;
  }
  return true;
}, {
  message: "Дотор зогсоолын төлбөрийн мэдээллийг бүрэн оруулна уу",
  path: ["indoor_price"],
}).refine((data) => {
  // Validate child age when children are allowed
  if (data.allow_children) {
    if (!data.max_child_age) return false;
    if (!data.child_bed_available) return false;
  }
  return true;
}, {
  message: "Хүүхдийн дээд нас болон хүүхдийн орны мэдээллийг оруулна уу",
  path: ["max_child_age"],
}).refine((data) => {
  // Validate extra bed price when extra bed is allowed
  if (data.allow_extra_bed) {
    if (!data.extra_bed_price) return false;
    const price = parseFloat(data.extra_bed_price);
    return !isNaN(price) && price > 0;
  }
  return true;
}, {
  message: "Нэмэлт орны үнийг оруулна уу",
  path: ["extra_bed_price"],
});



export const schemaHotelSteps5 = z.object({
  entries: z.array(
    z.object({
      images: z
        .string()
        .url({ message: 'Image must be a valid URL.' })
        .min(1, { message: 'Image URL is required.' }),
      descriptions: z
        .string()
        .min(1, { message: 'Description must not be empty.' }),
    })
  ).min(5, { message: 'At least 5 images are required.' }),
});


export const schemaHotelSteps6 = z.object({
  general_facilities: z
    .array(z.string())
    .min(1, { message: 'Select at least one general facility' }),
});

export const schemaRegistrationEmployee2 =z.object({
  email: z.string().email({ message: "И-мэйлийн формат стандарт биш байна" }).max(255, { message: "255 -aaс дээш тэмдэгт агуулж болохгүй" }),
  contact_person_name: z.string().min(3, { message: "Та өөрийн нэрээ заавал бичиж оруулна уу?" }),
  user_type: z.number().min(1, { message: "User type is required" }),
  // user_type_id: z.string(),
  position: z.string().min(3, {message:"Та өөрийн албан тушаалаа бичнэ үү?"} ),
  contact_number: z.string().min(8, { message: "Та холбогдох утасны дугаараа заавал оруулна уу?" }),
password: z.string().min(8, {
  message: "Нууц үг нь дор хаяж 8 тэмдэгтээс бүрдэх ёстой бөгөөд нэг том үсэг, нэг жижиг үсэг, нэг тоо, нэг тусгай тэмдэгт агуулсан байх шаардлагатай.",
}).max(100, {
  message: "Нууц үг нь 100 тэмдэгтээс хэтрэх ёсгүй.",
}).regex(/[a-z]/, {
  message: "Нууц үг нь дор хаяж нэг жижиг үсэг агуулсан байх шаардлагатай.",
}).regex(/[A-Z]/, {
  message: "Нууц үг нь дор хаяж нэг том үсэг агуулсан байх шаардлагатай.",
}).regex(/\d/, {
  message: "Нууц үг нь дор хаяж нэг тоо агуулсан байх шаардлагатай.",
}).regex(/[@$!%*;?&#]/, {
  message: "Нууц үг нь дор хаяж нэг тусгай тэмдэгт (@$!%*;?&# гэх мэт) агуулсан байх шаардлагатай.",
}),
confirmPassword: z.string().min(8, {
  message: "Нууц үг нь дор хаяж 8 тэмдэгтээс бүрдэх ёстой.",
}),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Нууц үг таарахгүй байна.",
  path: ["confirmPassword"],
});




export const schemaRegistrationEmployee = z
.object({

  email: z
    .string()
    .email({ message:"Email format is invalid"})
    .max(255, { message: "Email address cannot exceed 255 characters"}),
  contact_person_name: z
    .string()
    .min(3, { message: "Холбоо барих хүний нэр" }),
    user_type : z 
    .string(),
  contact_number: z
    .string()
    .min(3, { message: "Гар утасны дугаар багадаа 3 оронтой байна."}),
  password: z
    .string()
    .min(8, {
      message:
       "The password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    })
    .max(100, {
      message:
      "The password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    })
    .regex(/[a-z]/, {
      message:
      
      "The password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    }) // Lowercase letter
    .regex(/[A-Z]/, {
      message:
      "The password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    }) // Uppercase letter
    .regex(/\d/, {
      message:
      "The password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    }) // Number
    .regex(/[@$!%*;?&#]/, {
      message:
      "The password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    }), // Special character
  // .min(8, { message: "Нууц үг дор хаяж 8 тэмдэгтийн урттай байна" })
  // .max(100, { message: "Нууц үг 100 тэмдэгтээс их байж болохгүй" })
  // .regex(/[a-z]/, {
  //   message: "Password must contain at least one lowercase letter",
  // }) // Lowercase letter
  // .regex(/[A-Z]/, {
  //   message: "Password must contain at least one uppercase letter",
  // }) // Uppercase letter
  // .regex(/\d/, { message: "Password must contain at least one number" }) // Number
  // .regex(/[@$!%*;?&#]/, {
  //   message: "Password must contain at least one special character",
  // }), // Special character
  confirmPassword: z.string().min(8, {
    message: "The password must be at least 8 characters long",
  }),
})


.refine((data) => data.password === data.confirmPassword, {
  message: "Password does not match",
  path: ["confirmPassword"], // Specify the path of the field to which the error belongs
});

export const buyerSchema = z.object({
type: z.number(), // Ensures 'type' is a positive integer
company_name_ch: z
  .string()
  .nonempty("Company name (Chinese) cannot be empty"),
director_name: z.string().nonempty("Director name cannot be empty"),
state_reg: z.string().nonempty("State registration cannot be empty"),
tax_number: z.string().nonempty("Tax number cannot be empty"),
customer_of_id: z.number().int().min(1), // Ensures 'customer_of_id' is a positive integer
bank_account: z.string().nonempty("Bank account cannot be empty"),
legal_entity_cert_reg: fileValidation,
taxpayer_cert_number: fileValidation,
cust_acc_desc: fileValidation,
eng_translation: fileValidation,
contract_file: fileValidation,
description: z.string().nonempty("Description cannot be empty"),
});

// Contract Organization Schema
export const schemaContractOrganization = z.object({
  organization_name: z.string().min(1, { message: "Байгууллагын нэрийг оруулна уу" }),
  registration_number: z.string().min(1, { message: "ААН-ийн регистрийн дугаарыг оруулна уу" }),
  organization_type: z.string().min(1, { message: "Төрөл сонгоно уу" }),
  discount_percent: z.string()
    .min(1, { message: "Хөнгөлөлтийн хувийг оруулна уу" })
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Буруу формат" })
    .refine((val) => {
      const num = parseFloat(val);
      return num >= 0 && num <= 100;
    }, { message: "Хөнгөлөлт 0-100 хувийн хооронд байх ёстой" }),
  promo_code: z.string().optional(),
  validity_start: z.string().min(1, { message: "Эхлэх огноо оруулна уу" }),
  validity_end: z.string().min(1, { message: "Дуусах огноо оруулна уу" }),
  contact_person_name: z.string().min(1, { message: "Нэр оруулна уу" }),
  contact_person_email: z.string().email({ message: "И-мэйл хаяг буруу байна" }),
  contact_person_phone: z.string().min(8, { message: "Утасны дугаар оруулна уу" }),
  financial_person_name: z.string().optional(),
  financial_person_email: z.string().email({ message: "И-мэйл хаяг буруу байна" }).optional().or(z.literal('')),
  financial_person_phone: z.string().optional(),
  accountant_person_name: z.string().optional(),
  accountant_person_email: z.string().email({ message: "И-мэйл хаяг буруу байна" }).optional().or(z.literal('')),
  accountant_person_phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

// Service Type Schema
export const schemaServiceType = z.object({
  name: z.string()
    .min(1, { message: "Үйлчилгээний төрлийн нэрийг оруулна уу" })
    .max(100, { message: "Нэр 100 тэмдэгтээс хэтрэхгүй байх ёстой" }),
});

// Service Schema
export const schemaService = z.object({
  name: z.string()
    .min(1, { message: "Үйлчилгээний нэрийг оруулна уу" })
    .max(100, { message: "Нэр 100 тэмдэгтээс хэтрэхгүй байх ёстой" }),
  price: z.string()
    .min(1, { message: "Үнийг оруулна уу" })
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Үнэ зөвхөн тоо байх ёстой" })
    .refine((val) => parseFloat(val) >= 0, { message: "Үнэ сөрөг байж болохгүй" }),
  service_type: z.string().min(1, { message: "Үйлчилгээний төрлийг сонгоно уу" }),
  category: z.string().optional(),
  is_countable: z.boolean().default(false),
  barcode: z.string().optional(),
});

// Employee/Worker Schema
export const schemaEmployee = z.object({
  name: z.string()
    .min(2, { message: "Нэр хамгийн багадаа 2 тэмдэгт байх ёстой" })
    .max(100, { message: "Нэр 100 тэмдэгтээс хэтрэхгүй байх ёстой" }),
  position: z.string()
    .min(1, { message: "Албан тушаалыг оруулна уу" })
    .max(100, { message: "Албан тушаал 100 тэмдэгтээс хэтрэхгүй байх ёстой" }),
  email: z.string()
    .min(1, { message: "И-мэйл хаягийг оруулна уу" })
    .email({ message: "И-мэйл хаяг буруу байна" }),
  contact_number: z.string()
    .min(8, { message: "Утасны дугаар хамгийн багадаа 8 оронтой байх ёстой" })
    .max(15, { message: "Утасны дугаар 15 оронтоос хэтрэхгүй байх ёстой" })
    .regex(/^[0-9+\-\s]+$/, { message: "Утасны дугаар зөвхөн тоо агуулах ёстой" }),
  password: z.string()
    .min(6, { message: "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой" })
    .regex(/[a-zA-Z]/, { message: "Нууц үг үсэг агуулсан байх ёстой" })
    .regex(/[0-9]/, { message: "Нууц үг тоо агуулсан байх ёстой" }),
  user_type: z.number()
    .min(2, { message: "Хэрэглэгчийн төрлийг сонгоно уу" })
    .max(5, { message: "Буруу хэрэглэгчийн төрөл" }),
});

// Employee Edit Schema (password optional)
export const schemaEmployeeEdit = z.object({
  name: z.string()
    .min(2, { message: "Нэр хамгийн багадаа 2 тэмдэгт байх ёстой" })
    .max(100, { message: "Нэр 100 тэмдэгтээс хэтрэхгүй байх ёстой" }),
  position: z.string()
    .min(1, { message: "Албан тушаалыг оруулна уу" })
    .max(100, { message: "Албан тушаал 100 тэмдэгтээс хэтрэхгүй байх ёстой" }),
  email: z.string()
    .min(1, { message: "И-мэйл хаягийг оруулна уу" })
    .email({ message: "И-мэйл хаяг буруу байна" }),
  contact_number: z.string()
    .min(8, { message: "Утасны дугаар хамгийн багадаа 8 оронтой байх ёстой" })
    .max(15, { message: "Утасны дугаар 15 оронтоос хэтрэхгүй байх ёстой" })
    .regex(/^[0-9+\-\s]+$/, { message: "Утасны дугаар зөвхөн тоо агуулах ёстой" }),
  password: z.string()
    .regex(/[a-zA-Z]/, { message: "Нууц үг үсэг агуулсан байх ёстой" })
    .regex(/[0-9]/, { message: "Нууц үг тоо агуулсан байх ёстой" })
    .min(6, { message: "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой" })
    .optional()
    .or(z.literal('')),
  user_type: z.number()
    .min(2, { message: "Хэрэглэгчийн төрлийг сонгоно уу" })
    .max(5, { message: "Буруу хэрэглэгчийн төрөл" }),
});

// Currency Rate Schema
export const schemaCurrencyRate = z.object({
  currency: z.string().min(1, { message: "Валют сонгоно уу" }),
  buy_rate: z.string()
    .min(1, { message: "Авах ханшийг оруулна уу" })
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Ханш зөвхөн тоо байх ёстой" })
    .refine((val) => parseFloat(val) > 0, { message: "Ханш 0-ээс их байх ёстой" }),
  sell_rate: z.string()
    .min(1, { message: "Зарах ханшийг оруулна уу" })
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Ханш зөвхөн тоо байх ёстой" })
    .refine((val) => parseFloat(val) > 0, { message: "Ханш 0-ээс их байх ёстой" }),
});

// Room Block Schema
export const schemaRoomBlock = z.object({
  room_type: z.string().min(1, { message: "Өрөөний төрлийг сонгоно уу" }),
  room: z.string().min(1, { message: "Өрөө сонгоно уу" }),
  start_date: z.string().min(1, { message: "Эхлэх огноо оруулна уу" }),
  end_date: z.string().min(1, { message: "Дуусах огноо оруулна уу" }),
  reason: z.string()
    .min(1, { message: "Шалтгаан оруулна уу" })
    .max(500, { message: "Шалтгаан 500 тэмдэгтээс хэтрэхгүй байх ёстой" }),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) <= new Date(data.end_date);
  }
  return true;
}, { message: "Эхлэх огноо дуусах огноонооос өмнө байх ёстой", path: ["end_date"] });

// Price Setting Schema
export const schemaPriceSetting = z.object({
  name: z.string()
    .min(1, { message: "Нэрийг оруулна уу" })
    .max(100, { message: "Нэр 100 тэмдэгтээс хэтрэхгүй байх ёстой" }),
  room_combination: z.string().min(1, { message: "Өрөөний төрлийг сонгоно уу" }),
  start_date: z.string().min(1, { message: "Эхлэх огноо оруулна уу" }),
  end_date: z.string().min(1, { message: "Дуусах огноо оруулна уу" }),
  adjustment_type: z.enum(['ADD', 'SUB'], { message: "Үнийн өөрчлөлтийн төрлийг сонгоно уу" }),
  value_type: z.enum(['PERCENT', 'AMOUNT'], { message: "Утгын төрлийг сонгоно уу" }),
  value: z.string()
    .min(1, { message: "Утга оруулна уу" })
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Утга зөвхөн тоо байх ёстой" }),
  is_active: z.boolean().default(true),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) <= new Date(data.end_date);
  }
  return true;
}, { message: "Эхлэх огноо дуусах огноонооос өмнө байх ёстой", path: ["end_date"] })
.refine((data) => {
  if (data.value_type === 'PERCENT') {
    const val = parseFloat(data.value);
    return val >= 0 && val <= 100;
  }
  return true;
}, { message: "Хувь 0-100 хооронд байх ёстой", path: ["value"] });
