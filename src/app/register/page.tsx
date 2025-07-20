import { GalleryVerticalEnd } from "lucide-react"
import { RegisterForm } from "@/components/register-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function RegisterPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <Card className="flex w-full max-w-sm flex-col gap-6 bg-card border border-border rounded-lg">
        <CardHeader>
          <CardTitle>Register for Connect</CardTitle>
          <CardDescription>Enter your details or register with Google</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  )
}
