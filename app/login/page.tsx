import LoginPage from "../fetaures/login";
import Image from "next/image";
export default function Page() {
  return (
    <div className="min-h-screen relative">
      {/* <Image
        src="/wechatimg/wechat.webp"
        alt="Background"
        width={400}
        height={300}
        className="object-contain"
      /> */}

      {/* <div className="absolute inset-0 bg-black/60"></div> */}

      <div className="relative z-10">
        <LoginPage />
      </div>
    </div>
  );
}
