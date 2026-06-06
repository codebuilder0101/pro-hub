import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Registers a new user server-side using the service-role key and marks the
// email as already confirmed (email_confirm: true). This lets registration
// log the user in immediately, without waiting for an email confirmation link
// (the project has mailer_autoconfirm disabled). The handle_new_user trigger
// creates the matching public.profiles row automatically.
export const registerUser = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().email(),
      password: z.string().min(6),
      username: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { username: data.username },
    });

    if (error) {
      // Surface a clean, stable code to the client for friendly messaging.
      const alreadyExists =
        error.status === 422 ||
        /already.*registered|already.*exists|email_exists/i.test(error.message);
      return {
        ok: false as const,
        code: alreadyExists ? "user_exists" : "create_failed",
        message: error.message,
      };
    }

    return { ok: true as const };
  });
