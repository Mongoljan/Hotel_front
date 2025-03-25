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
    email: z.string().email('И-мэйл хаяг зөв биш байна'),
    password: z.string().min(1, { message: "schemas_enteremail"}),
  });


export const schemaCreateRoom = z.object({
    room_number: z.string().min(1, { message: "Room number is required" }),
    room_type: z.string().min(1, { message: "Room type is required" }),
    room_category:  z.string().min(1, { message: "Room category is required" }),
    room_size: z.string().min(1, { message: "Room size must be at least 5m²" }),
    bed_type: z.string().min(1, { message: "Bed type is required" }),
    is_Bathroom: z.string().min(1, { message: "Нэгийг сонгонo уу?"}),
    room_Facilities: z.array(z.string()).min(1, { message: "Select at least one facility" }),
    bathroom_Items: z.array(z.string()).min(1, { message: "Select at least one facility" }),
    free_Toiletries: z.array(z.string()).min(1, { message: "Select at least one facility" }),
    food_And_Drink: z.array(z.string()).min(1, { message: "Select at least one facility" }),
    outdoor_And_View: z.array(z.string()).min(1, { message: "Select at least one facility" }),
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
  .min(7, { message:"Байгууллагын РД 7 оронтой байх ёстойг анхаарна уу?",})
  .max(7, { message:"Байгууллагын РД 7 оронтой байх ёстойг анхаарна уу?",}),
  CompanyName: z
  .string(),
  PropertyName : z
  .string(),
  location : z
  .string(),
  property_type: z
  .string(),
  phone: z 
  .string()
  .min(8, {message:"Гар утасны дугаарыг оруулна уу? "}),
  mail: z 
  .string()
  .email({message: "И-мэйл хаяг буруу байна"}),


})

export const schemaHotelSteps1 = z.object({
  property_name_mn: z.string().min(1, { message: "Монгол нэрийг оруулна уу" }),
  property_name_en: z.string().min(1, { message: "Англи нэрийг оруулна уу" }),
  start_date: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    { message: "Эхлэх огноо буруу байна" }
  ),
  star_rating: z
    .string()
    .min(1, { message: "Одны зэрэглэл хамгийн багадаа 1 байх ёстой" })
    .max(5, { message: "Одны зэрэглэл хамгийн ихдээ 5 байх ёстой" }),
  part_of_group: z.boolean(),
  total_hotel_rooms: z
    .string()
    .min(1, { message: "Нийт өрөөний тоо хамгийн багадаа 1 байх ёстой" }),
  available_rooms: z
    .string()
    .min(0, { message: "Боломжит өрөөний тоо сөрөг байж болохгүй" }),
  sales_room_limitation: z.boolean(),
  languages: z
    .array(z.string())
    .min(1, { message: "Хамгийн багадаа нэг хэл сонгоно уу" }),
});

export const schemaHotelSteps2 = z.object({
  zipCode: z
    .string()
    .min(4, { message: "Шуудангийн код хамгийн багадаа 4 оронтой байх ёстой" })
    .max(10, { message: "Шуудангийн код хамгийн ихдээ 10 оронтой байх ёстой" }),
  total_floor_number: z
    .string()
    .min(1, { message: "Барилгын давхарын тоо хамгийн багадаа 1 байх ёстой" }),
  province_city: z
    .string()
    .min(1, { message: "Хот/аймгийн мэдээллийг оруулна уу" }),
  city: z
    .string()
    .min(1, { message: "Хорооны мэдээллийг оруулна уу" }),
  soum: z
    .string()
    .min(1, { message: "Сум/дүүргийн мэдээллийг оруулна уу" }),
  district: z
    .string()
    .min(1, { message: "Дүүргийн мэдээллийг оруулна уу" }),
});

export const schemaHotelSteps3 = z.object({
  cancel_time: z.string(),
  before_fee: z.string(),
  after_fee: z.string(),
  subsequent_days_percentage: z.string(),
  special_condition_percentage: z.string(),
  check_in_from: z.string(),
  check_in_until: z.string(),
  check_out_from: z.string(),
  check_out_until: z.string(),
  breakfast_policy: z.string(),
  allow_children: z.boolean(),
  allow_pets: z.boolean(),
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
  ).min(1, { message: 'At least one image and description set is required.' }),
});


export const schemaHotelSteps6 = z.object({
  google_map: z
    .string()
    .url({ message: 'Please enter a valid Google Maps URL' }),
  parking_situation: z
    .string()
    .min(2, {message:"enter valid reason"}),
  general_facilities: z
    .array(z.string())
    .min(1, { message: 'Select at least one general facility' }),
});

export const schemaRegistrationEmployee2 =z.object({
  email: z.string().email({ message: "Email format is invalid" }).max(255, { message: "Email address cannot exceed 255 characters" }),
  contact_person_name: z.string().min(3, { message: "Холбоо барих хүний нэр" }),
  user_type: z.number().min(1, { message: "User type is required" }),
  // user_type_id: z.string(),
  position: z.string(),
  contact_number: z.string().min(3, { message: "Гар утасны дугаар багадаа 3 оронтой байна." }),
  password: z.string().min(8, {
    message: "The password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
  }).max(100, {
    message: "Password cannot exceed 100 characters",
  }).regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/\d/, { message: "Password must contain at least one number" })
    .regex(/[@$!%*;?&#]/, { message: "Password must contain at least one special character" }),
  confirmPassword: z.string().min(8, { message: "The password must be at least 8 characters long" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
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
