import Link from "next/link";

export default function PostCard({ post }) {
  return (
    <div className="border border-slate-400 border-dashed p-12 rounded-md h-full bg-white">
      <p className="text-xs text-slate-600">
        {post._id.getTimestamp().toLocaleString()}
      </p>
      <Link
        href={`/posts/show/${post._id.toString()}`}
        className="block text-xl font-semibold mb-4"
      >
        {post.title}
      </Link>
      <p className="text-sm">{post.content}</p>
    </div>
  );
}
