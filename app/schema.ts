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
