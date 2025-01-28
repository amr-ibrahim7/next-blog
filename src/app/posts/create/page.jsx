import { createPost } from "@/actions/post";
import BlogForm from "@/components/BlogForm";

export default async function create() {
  return (
    <div className="container w-1/2">
      <h1 className="title">Create a new Post</h1>

      <BlogForm handler={createPost} />
    </div>
  );
}
