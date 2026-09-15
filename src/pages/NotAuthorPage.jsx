import { ShieldAlert } from "lucide-react"

export default function NotAuthorPage() {
  return (
    <>
      <div className="w-full flex flex-col items-center justify-center gap-4">
        <ShieldAlert className="w-10 h-10 bg-gray-650"/>
        <p className="text-2xl text-gray-700">Bạn không đươc phép truy cập thông tin này !</p>
      </div>
    </>
  )
}
