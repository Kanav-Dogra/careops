import Link from "next/link";

export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Link
        href="/signup"
        className="px-6 py-3 bg-black text-white rounded-lg"
      >
        Go to Signup/SignIn Page
      </Link>
    </div>
  );
}
