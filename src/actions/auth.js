"use server";
import { getCollection } from "@/lib/db";
import { LoginFormSchema, RegisterFormSchema } from "@/lib/rules";
import { createSession } from "@/lib/session";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function register(state, formData) {
  //   await new Promise((resolve) => setTimeout(resolve, 3000));

  // Validate form fields
  const validatedFields = RegisterFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  // console.log(validatedFields);

  // If any form fields are invalid
  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      email: formData.get("email"),
    };
  }

  // Extract form fields
  const { email, password } = validatedFields.data;
  // Check if email is already registered
  const userCollection = await getCollection("users");
  if (!userCollection) return { errors: { email: "Server error!" } };
  const existingUser = await userCollection.findOne({ email });
  if (existingUser) {
    return {
      errors: {
        email: "Email already exists.",
      },
    };
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  // Save user to database
  const results = await userCollection.insertOne({
    email,
    password: hashedPassword,
  });

  // Create a Session
  await createSession(results.insertedId.toString());
  // Redirect to home page

  redirect("/");
}

export async function login(state, formData) {
  //  Validate form fields
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  //  If any form fields are invalid
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      email: formData.get("email"),
    };
  }
  // Extract form fields

  const { email, password } = validatedFields.data;
  // Check if email is exists in our DB

  const userCollection = await getCollection("users");
  if (!userCollection) return { errors: { email: "Server error!" } };

  const existingUser = await userCollection.findOne({ email });
  if (!existingUser) {
    return { errors: { email: "Invalid Credentials" } };
  }
  // check password

  const matchedPassword = await bcrypt.compare(password, existingUser.password);
  if (!matchedPassword) {
    return { errors: { email: "Invalid Credentials" } };
  }
  // Create a session
  await createSession(existingUser._id.toString());
  console.log(existingUser);
  // Redirect
  redirect("/dashboard");
}

export async function logout() {
  // Clear the session
  const cookieStore = await cookies();
  cookieStore.delete("session");
  // Redirect to home page
  redirect("/");
}
