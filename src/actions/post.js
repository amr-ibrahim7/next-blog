"use server";

import { getCollection } from "@/lib/db";
import getAuthUser from "@/lib/getAuthUser";
import { BlogPostSchema } from "@/lib/rules";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPost(state, formData) {
  // check is user is signed in
  const user = await getAuthUser();

  if (!user) return redirect("/");

  // validate form fields
  const title = formData.get("title");
  const content = formData.get("content");

  const validatedFields = BlogPostSchema.safeParse({
    title,
    content,
  });

  // if any form fields are invalid

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      title,
      content,
    };
  }
  // Save the new post in DB

  try {
    const postCollection = await getCollection("posts");
    const post = {
      title: validatedFields.data.title,
      content: validatedFields.data.content,
      userId: ObjectId.createFromHexString(user.userId),
    };
    await postCollection.insertOne(post);
  } catch {
    return {
      errors: { title: error.message },
    };
  }

  redirect("/dashboard");
}
export async function updatePost(state, formData) {
  // check is user is signed in
  const user = await getAuthUser();

  if (!user) return redirect("/");

  // validate form fields
  const title = formData.get("title");
  const content = formData.get("content");
  const postId = formData.get("postId");

  const validatedFields = BlogPostSchema.safeParse({
    title,
    content,
  });

  // if any form fields are invalid
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      title,
      content,
    };
  }

  // find the post
  const postsCollection = await getCollection("posts");
  const post = await postsCollection.findOne({
    _id: ObjectId.createFromHexString(postId),
  });

  // check the user owns the post
  if (user.userId !== post.userId.toString()) {
    return redirect("/");
  }
  // update the post in DB

  postsCollection.findOneAndUpdate(
    { _id: post._id },
    {
      $set: {
        title: validatedFields.data.title,
        content: validatedFields.data.content,
      },
    }
  );

  redirect("/dashboard");
}

export async function deletePost(formData) {
  // check is user is signed in
  const user = await getAuthUser();

  if (!user) return redirect("/");

  // find the post

  const postCollection = await getCollection("posts");
  const post = await postCollection.findOne({
    _id: ObjectId.createFromHexString(formData.get("postId")),
  });

  // check the user owns the post
  if (user.userId !== post.userId.toString()) {
    return redirect("/");
  }

  // delete the post from DB

  postCollection.findOneAndDelete({
    _id: post._id,
  });

  revalidatePath("/dashboard");
}
