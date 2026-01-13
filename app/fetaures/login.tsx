"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import { loginUser } from "../redux/features/auth/auththunk";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(loginUser({ email, password })).unwrap();
      router.push("/dashboard");
    } catch (err) {
      console.error("Login failed");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Background */}
      <Image
        src="/wechatimg/wechat.webp"
        alt="Background"
        fill
        className="object-cover"
        priority
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Login Card */}
      <Card className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <Image
              src="/wechatimg/wechat.webp"
              alt="Logo"
              width={60}
              height={60}
              className="rounded-xl"
            />
          </div>

          <CardTitle className="text-3xl font-bold text-white">
            Welcome Back
          </CardTitle>
          <p className="text-zinc-300 text-sm">Login to continue chatting</p>
        </CardHeader>

        <CardContent>
          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-1">
              <Label className="text-zinc-300">Email</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                className="bg-white/10 border-white/20 text-white placeholder:text-zinc-400 focus:border-white focus:ring-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-zinc-300">Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                className="bg-white/10 border-white/20 text-white placeholder:text-zinc-400 focus:border-white focus:ring-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-5 rounded-xl transition-all"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            <p className="text-sm text-center text-zinc-300">
              Don’t have an account?{" "}
              <Link
                href="/register"
                className="text-white font-medium hover:underline"
              >
                Register
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
