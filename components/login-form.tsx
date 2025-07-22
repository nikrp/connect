"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect } from "react";

export function LoginForm() {
  const supabase = createClient()
  
  useEffect(() => {
    async function thing() {
      const user = await supabase.auth.getUser();

      console.log(user);
    }

    thing()
  }, []);

  return (
    <div>
    </div>
  )
}
