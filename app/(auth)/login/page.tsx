// export default function LoginPage() {
//   return (
//     <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eef4fc] px-6 py-12">
//       {/* Ambient background */}
//       <div className="pointer-events-none absolute inset-0">
//         <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />
//         <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />
//       </div>

//       {/* Login card */}
//       <div className="relative w-full max-w-md">
//         {/* Brand */}
//         <div className="mb-8 text-center">
//           <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-sm">
//             M
//           </div>

//           <h1 className="text-xl font-semibold tracking-tight text-slate-900">
//             Margin Intelligence
//           </h1>
//         </div>

//         <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
//           {/* Heading */}
//           <div className="mb-8">
//             <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
//               Welcome back
//             </h2>

//             <p className="mt-2 text-sm leading-6 text-slate-500">
//               Sign in to understand your products, costs, and margins.
//             </p>
//           </div>

//           {/* Form */}
//           <form className="space-y-5">
//             {/* Email */}
//             <div>
//               <label
//                 htmlFor="email"
//                 className="mb-2 block text-sm font-medium text-slate-700"
//               >
//                 Email address
//               </label>

//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 autoComplete="email"
//                 placeholder="you@example.com"
//                 className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
//               />
//             </div>

//             {/* Password */}
//             <div>
//               <div className="mb-2 flex items-center justify-between">
//                 <label
//                   htmlFor="password"
//                   className="block text-sm font-medium text-slate-700"
//                 >
//                   Password
//                 </label>

//                 <button
//                   type="button"
//                   className="text-xs font-medium text-blue-600 transition hover:text-blue-700"
//                 >
//                   Forgot password?
//                 </button>
//               </div>

//               <input
//                 id="password"
//                 name="password"
//                 type="password"
//                 autoComplete="current-password"
//                 placeholder="Enter your password"
//                 className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
//               />
//             </div>

//             {/* Submit */}
//             <button
//               type="submit"
//               className="h-11 w-full rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:bg-blue-800"
//             >
//               Sign in
//             </button>
//           </form>

//           {/* Future signup */}
//           <p className="mt-6 text-center text-sm text-slate-500">
//             Don&apos;t have an account?{" "}
//             <button
//               type="button"
//               className="font-medium text-blue-600 transition hover:text-blue-700"
//             >
//               Create one
//             </button>
//           </p>
//         </div>

//         {/* Footer */}
//         <p className="mt-6 text-center text-xs text-slate-400">
//           © 2026 Margin Intelligence
//         </p>
//       </div>
//     </main>
//   );
// }

import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eef4fc] px-6 py-12">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />
      </div>

      {/* Login card */}
      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-sm">
            M
          </div>

          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Margin Intelligence
          </h1>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Welcome back
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sign in to understand your products, costs, and margins.
            </p>
          </div>

          <LoginForm />

          {/* Future signup */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              className="font-medium text-blue-600 transition hover:text-blue-700"
            >
              Create one
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-400">
          © 2026 Margin Intelligence
        </p>
      </div>
    </main>
  );
}